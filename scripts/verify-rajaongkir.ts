import {
  DEFAULT_ORIGIN,
  searchDestinations,
  calculateShippingRates,
  calculateBillableWeightKg,
  parseRajaOngkirCostResponse,
  parseRajaOngkirDestinationResponse,
  getRajaOngkirApiKey,
  setRajaOngkirApiKey,
  MOCK_DESTINATIONS,
} from '../src/services/rajaongkir';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- TEST 1: Default Origin Verification ---');
  assert(DEFAULT_ORIGIN.id === 34320, 'Default origin ID must be 34320');
  assert(DEFAULT_ORIGIN.city.includes('Jakarta'), 'Default origin must be in Jakarta');
  console.log('✓ Default origin correctly set to:', DEFAULT_ORIGIN.label);

  console.log('\n--- TEST 2: Destination Search & Parsing ---');
  // Empty search
  const defaultList = await searchDestinations('');
  assert(defaultList.length > 0, 'Empty search should return top destinations');
  console.log(`✓ Empty query returned ${defaultList.length} destinations`);

  // Search Jakarta
  const jakartaResults = await searchDestinations('jakarta');
  assert(jakartaResults.length > 0, 'Search for Jakarta should return results');
  assert(jakartaResults.some(d => d.province.includes('Jakarta')), 'Should find DKI Jakarta');
  console.log(`✓ "jakarta" query found ${jakartaResults.length} matches`);

  // Search Surabaya
  const surabayaResults = await searchDestinations('surabaya');
  assert(surabayaResults.length > 0, 'Search for Surabaya should return results');
  assert(surabayaResults[0].city.includes('Surabaya'), 'Top match must be Surabaya');
  console.log(`✓ "surabaya" query found: ${surabayaResults[0].label}`);

  // Search Medan
  const medanResults = await searchDestinations('medan');
  assert(medanResults.length > 0, 'Search for Medan should return results');
  assert(medanResults[0].province.includes('Sumatera'), 'Medan province must be Sumatera Utara');
  console.log(`✓ "medan" query found: ${medanResults[0].label}`);

  // Search unlisted small town
  const unlistedResults = await searchDestinations('Waikabubak');
  assert(unlistedResults.length > 0, 'Unlisted location should generate valid fallback');
  assert(unlistedResults[0].city === 'Waikabubak', 'Generated entry should match query');
  console.log(`✓ Fallback generated for unlisted query: ${unlistedResults[0].label}`);

  // Verify Komerce V2 destination API parser
  const mockKomerceDestinationResponse = {
    meta: { code: 200, status: 'success', message: 'Success' },
    data: [
      {
        id: 31555,
        label: 'Gambir, Jakarta Pusat, DKI Jakarta, 10110',
        province: 'DKI Jakarta',
        city: 'Jakarta Pusat',
        district: 'Gambir',
        subdistrict: 'Gambir',
        zip_code: '10110',
      },
    ],
  };
  const parsedDest = parseRajaOngkirDestinationResponse(mockKomerceDestinationResponse);
  assert(parsedDest.length === 1, 'Should parse Komerce destination');
  assert(parsedDest[0].id === 31555, 'Destination ID must match');
  assert(parsedDest[0].city === 'Jakarta Pusat', 'City must match');
  console.log('✓ Komerce V2 destination JSON parsed correctly:', parsedDest[0].label);

  console.log('\n--- TEST 3: Real Komerce V2 J&T Express Nested Cost Parsing ---');
  // Test nested `costs[].cost[].value` format (standard Komerce V2 J&T live response)
  const mockKomerceCostResponse = {
    meta: {
      code: 200,
      status: 'success',
      message: 'Successful calculate domestic cost',
    },
    data: [
      {
        code: 'jnt',
        name: 'J&T Express',
        costs: [
          {
            service: 'EZ',
            description: 'Layanan Reguler J&T Express',
            cost: [
              {
                value: 10000,
                etd: '1-2',
                note: '',
              },
            ],
          },
          {
            service: 'Super',
            description: 'Kiriman Kilat J&T Express (Besok Sampai)',
            cost: [
              {
                value: 18000,
                etd: '1-1',
                note: '',
              },
            ],
          },
          {
            service: 'ECO',
            description: 'Tarif Hemat Ekonomis J&T Express',
            cost: [
              {
                value: 8000,
                etd: '2-3',
                note: '',
              },
            ],
          },
        ],
      },
    ],
  };

  const parsedCostOptions = parseRajaOngkirCostResponse(mockKomerceCostResponse);
  assert(parsedCostOptions.length === 3, 'Should parse 3 J&T Express services');
  assert(typeof parsedCostOptions[0].cost === 'number', 'Parsed cost must be a numeric primitive');
  assert(parsedCostOptions[0].cost === 8000, 'Lowest cost option (J&T ECO) should be first: 8000');
  assert(parsedCostOptions[0].courier_code === 'jnt', 'Courier code must be jnt');
  assert(parsedCostOptions[0].badge === 'Paling Hemat', 'J&T ECO should receive Paling Hemat badge');
  assert(parsedCostOptions[1].cost === 10000, 'Second option should be J&T EZ: 10000');
  assert(parsedCostOptions[1].badge === 'Paling Populer', 'J&T EZ should receive Paling Populer badge');
  assert(parsedCostOptions[2].cost === 18000, 'Third option should be J&T Super: 18000');
  assert(parsedCostOptions[2].badge === 'Tercepat (Esok Hari)', 'J&T Super should receive fastest badge');
  console.log('✓ Komerce V2 J&T Express nested costs successfully parsed:');
  parsedCostOptions.forEach(o => {
    console.log(`   • [${o.courier_code.toUpperCase()}] ${o.service}: Rp${o.cost} (${o.etd}) [${o.badge || 'Standar'}]`);
  });

  // Test flat cost format for J&T Express
  const mockFlatCostResponse = {
    data: [
      {
        code: 'jnt',
        name: 'J&T Express',
        costs: [
          {
            service: 'EZ',
            description: 'Layanan Reguler J&T Express',
            cost: 10000,
            etd: '1-2',
          },
        ],
      },
    ],
  };
  const parsedFlat = parseRajaOngkirCostResponse(mockFlatCostResponse);
  assert(parsedFlat.length === 1 && parsedFlat[0].cost === 10000, 'Flat cost should parse correctly');
  assert(parsedFlat[0].courier_code === 'jnt', 'Must be jnt courier');
  console.log('✓ Flat cost number format parsed correctly: Rp' + parsedFlat[0].cost);

  // Test strict rejection of non-J&T couriers (JNE, POS, TIKI)
  const mockJneOnly = {
    data: [
      {
        code: 'jne',
        name: 'JNE Express',
        costs: [{ service: 'REG', cost: [{ value: 15000 }] }],
      },
    ],
  };
  const rejectedNonJnt = parseRajaOngkirCostResponse(mockJneOnly);
  assert(rejectedNonJnt.length === 0, 'Non-J&T couriers must be strictly rejected (expected 0, got ' + rejectedNonJnt.length + ')');
  console.log('✓ Non-J&T couriers successfully rejected from rate list');

  console.log('\n--- TEST 4: Weight Tolerance & Scaling Calculation (J&T Express Only) ---');
  // Weight <= 1000g -> 1kg
  assert(calculateBillableWeightKg(200) === 1, '200g should bill as 1kg');
  assert(calculateBillableWeightKg(1000) === 1, '1000g should bill as 1kg');

  // Indonesian courier 300g tolerance
  // 1200g is <= 1300g -> billed as 1kg!
  assert(calculateBillableWeightKg(1200) === 1, '1200g should bill as 1kg under standard tolerance');
  assert(calculateBillableWeightKg(1300) === 1, '1300g should bill as 1kg at tolerance boundary');
  assert(calculateBillableWeightKg(1350) === 2, '1350g should bill as 2kg');
  assert(calculateBillableWeightKg(2300) === 2, '2300g should bill as 2kg at tolerance boundary');
  assert(calculateBillableWeightKg(2500) === 3, '2500g should bill as 3kg');
  console.log('✓ Indonesian courier 300g weight tolerance verified');

  const jabodetabekDest = MOCK_DESTINATIONS[0]; // Tebet, Jakarta Selatan
  const jaboRates = await calculateShippingRates(jabodetabekDest, 500); // 500g (billable as 1kg)
  assert(jaboRates.length > 0, 'Should return rates for Jabodetabek');

  // Verify courier is exclusively J&T Express
  const courierCodes = new Set(jaboRates.map(r => r.courier_code));
  assert(courierCodes.has('jnt'), 'Must include J&T Express (jnt)');
  assert(courierCodes.size === 1, 'Must strictly include ONLY J&T Express (no other couriers)');
  console.log(`✓ Courier selection strictly limited to J&T Express: ${Array.from(courierCodes).join(', ')}`);

  // Verify specific J&T services
  const jntEz = jaboRates.find(r => r.courier_code === 'jnt' && r.service === 'EZ');
  assert(!!jntEz, 'Must have J&T EZ');
  assert(jntEz!.cost === 10000, `J&T EZ in Jabodetabek should be 10000, got ${jntEz!.cost}`);

  const jntSuper = jaboRates.find(r => r.courier_code === 'jnt' && r.service === 'Super');
  assert(!!jntSuper, 'Must have J&T Super');
  assert(jntSuper!.cost === 18000, `J&T Super in Jabodetabek should be 18000, got ${jntSuper!.cost}`);

  const jntEco = jaboRates.find(r => r.courier_code === 'jnt' && r.service === 'ECO');
  assert(!!jntEco, 'Must have J&T ECO');
  assert(jntEco!.cost === 8000, `J&T ECO in Jabodetabek should be 8000, got ${jntEco!.cost}`);

  console.log('✓ J&T EZ:', jntEz!.cost, jntEz!.etd, '| J&T Super:', jntSuper!.cost, jntSuper!.etd, '| J&T ECO:', jntEco!.cost);

  // Scaled 2500g package
  const heavyRates = await calculateShippingRates(jabodetabekDest, 2500);
  const heavyJntEz = heavyRates.find(r => r.courier_code === 'jnt' && r.service === 'EZ');
  assert(heavyJntEz!.cost === 30000, `3 kg J&T EZ should be 30000 (3x 10000), got ${heavyJntEz!.cost}`);
  console.log('✓ 2500g package correctly scaled to 3kg rate: Rp' + heavyJntEz!.cost);

  console.log('\n--- TEST 5: Regional Rate Variation (Luar Jawa) ---');
  const medanDest = MOCK_DESTINATIONS.find(d => d.city.includes('Medan'))!;
  const medanRates = await calculateShippingRates(medanDest, 1000);
  const medanJntEz = medanRates.find(r => r.courier_code === 'jnt' && r.service === 'EZ');
  assert(medanJntEz!.cost > jntEz!.cost, 'Shipping to Medan should cost more than Jabodetabek');
  console.log('✓ Medan J&T EZ rate: Rp' + medanJntEz!.cost + ' (' + medanJntEz!.etd + ')');

  console.log('\n--- TEST 6: API Key Storage ---');
  setRajaOngkirApiKey('test-komerce-key-12345');
  assert(getRajaOngkirApiKey() === 'test-komerce-key-12345', 'API key getter should return saved key');
  setRajaOngkirApiKey('');
  console.log('✓ API Key getter & setter functioning properly');

  console.log('\n🎉 ALL VERIFICATION TEST SUITES PASSED CLEANLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
