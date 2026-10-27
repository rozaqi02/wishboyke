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

  console.log('\n--- TEST 3: Real Komerce V2 Nested Cost Parsing (CRITICAL FIX) ---');
  // Test nested `costs[].cost[].value` format (standard Komerce V2 live response)
  const mockKomerceCostResponse = {
    meta: {
      code: 200,
      status: 'success',
      message: 'Successful calculate domestic cost',
    },
    data: [
      {
        code: 'jne',
        name: 'Jalur Nugraha Ekakurir (JNE)',
        costs: [
          {
            service: 'REG',
            description: 'Layanan Reguler',
            cost: [
              {
                value: 17000,
                etd: '2-3',
                note: '',
              },
            ],
          },
          {
            service: 'YES',
            description: 'Yakin Esok Sampai',
            cost: [
              {
                value: 32000,
                etd: '1-1',
                note: '',
              },
            ],
          },
        ],
      },
      {
        code: 'pos',
        name: 'POS Indonesia',
        costs: [
          {
            service: 'Pos Reguler',
            description: 'Layanan Reguler POS',
            cost: [
              {
                value: 15000,
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
  assert(parsedCostOptions.length === 3, 'Should parse 3 courier services');
  assert(typeof parsedCostOptions[0].cost === 'number', 'Parsed cost must be a numeric primitive');
  assert(parsedCostOptions[0].cost === 15000, 'Lowest cost option (POS) should be first: 15000');
  assert(parsedCostOptions[0].courier_code === 'pos', 'First option should be POS (sorted ascending)');
  assert(parsedCostOptions[1].cost === 17000, 'Second option should be JNE REG: 17000');
  assert(parsedCostOptions[1].etd.includes('2-3'), 'ETD should be extracted from nested cost array: ' + parsedCostOptions[1].etd);
  assert(parsedCostOptions[2].cost === 32000, 'Third option should be JNE YES: 32000');
  assert(parsedCostOptions[2].badge === 'Tercepat (Esok Hari)', 'JNE YES should receive fastest badge');
  console.log('✓ Komerce V2 nested costs successfully parsed:');
  parsedCostOptions.forEach(o => {
    console.log(`   • [${o.courier_code.toUpperCase()}] ${o.service}: Rp${o.cost} (${o.etd}) [${o.badge || 'Standar'}]`);
  });

  // Test flat cost format
  const mockFlatCostResponse = {
    data: [
      {
        code: 'tiki',
        name: 'TIKI',
        costs: [
          {
            service: 'REG',
            description: 'Regular Service TIKI',
            cost: 16000,
            etd: '2-3',
          },
        ],
      },
    ],
  };
  const parsedFlat = parseRajaOngkirCostResponse(mockFlatCostResponse);
  assert(parsedFlat.length === 1 && parsedFlat[0].cost === 16000, 'Flat cost should parse correctly');
  console.log('✓ Flat cost number format parsed correctly: Rp' + parsedFlat[0].cost);

  console.log('\n--- TEST 4: Weight Tolerance & Scaling Calculation ---');
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

  // Verify Starter Couriers: JNE, POS, TIKI
  const courierCodes = new Set(jaboRates.map(r => r.courier_code));
  assert(courierCodes.has('jne'), 'Must include JNE (Starter courier)');
  assert(courierCodes.has('pos'), 'Must include POS Indonesia (Starter courier)');
  assert(courierCodes.has('tiki'), 'Must include TIKI (Starter courier)');
  console.log(`✓ RajaOngkir Starter couriers present: ${Array.from(courierCodes).join(', ')}`);

  // Verify specific services
  const jneReg = jaboRates.find(r => r.courier_code === 'jne' && r.service === 'REG');
  assert(!!jneReg, 'Must have JNE REG');
  assert(jneReg!.cost === 10000, `JNE REG in Jabodetabek should be 10000, got ${jneReg!.cost}`);

  const jneYes = jaboRates.find(r => r.courier_code === 'jne' && r.service === 'YES');
  assert(!!jneYes, 'Must have JNE YES');
  assert(jneYes!.cost === 18000, `JNE YES in Jabodetabek should be 18000, got ${jneYes!.cost}`);

  console.log('✓ JNE REG:', jneReg!.cost, jneReg!.etd, '| JNE YES:', jneYes!.cost, jneYes!.etd);

  // Scaled 2500g package
  const heavyRates = await calculateShippingRates(jabodetabekDest, 2500);
  const heavyJneReg = heavyRates.find(r => r.courier_code === 'jne' && r.service === 'REG');
  assert(heavyJneReg!.cost === 30000, `3 kg JNE REG should be 30000 (3x 10000), got ${heavyJneReg!.cost}`);
  console.log('✓ 2500g package correctly scaled to 3kg rate: Rp' + heavyJneReg!.cost);

  console.log('\n--- TEST 5: Regional Rate Variation (Luar Jawa) ---');
  const medanDest = MOCK_DESTINATIONS.find(d => d.city.includes('Medan'))!;
  const medanRates = await calculateShippingRates(medanDest, 1000);
  const medanJneReg = medanRates.find(r => r.courier_code === 'jne' && r.service === 'REG');
  assert(medanJneReg!.cost > jneReg!.cost, 'Shipping to Medan should cost more than Jabodetabek');
  console.log('✓ Medan JNE REG rate: Rp' + medanJneReg!.cost + ' (' + medanJneReg!.etd + ')');

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
