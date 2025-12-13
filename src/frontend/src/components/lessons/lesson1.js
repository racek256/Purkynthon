/*
import { Position } from '@xyflow/react';

// Konstanty pro čistší layout
const Y_CENTER = 200;
const X_START = 100;
const GAP = 300;

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

const Name= "placeholder level"
const mission= "placeholder"

const initialNodes = [
  {
    id: 'n1',
    type: 'input',
    position: { x: X_START, y: Y_CENTER },
    data: { label: 'Input Number' },
    // Kód ukazuje, že zde vzniká hodnota
    code: `print('e')
for i in range(5):
    print('xddd')
print('xd')

return 1
`,
    ...nodeDefaults,
  },
  {
    id: 'n2',
    position: { x: X_START + GAP, y: Y_CENTER },
    data: { label: 'Multiplier' },
    // Kód ukazuje jednoduchou matematiku
    code: `return input_value * 2`,
    ...nodeDefaults,
  },
  {
    id: 'n3',
    type: 'output',
    position: { x: X_START + GAP * 2, y: Y_CENTER },
    data: { label: 'Console Output' },
    // Kód ukazuje výsledek
    code: `print(input_value)`,
    ...nodeDefaults,
  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
  },
  {
    id: 'e2-3',
    source: 'n2',
    target: 'n3',
  }
];

export { initialNodes, initialEdges };
*/

import { Position } from '@xyflow/react';

// Konstanty pro layout
const Y_CENTER = 200;
const X_START = 100;
const GAP = 300;

const nodeDefaults = {
  sourcePosition: Position.Right,
  targetPosition: Position.Left,
};

// Název a mise
export const name = "Level 1: Oprava převodníku";
export const description = "Náš převodník teploty přestal fungovat. Technik vymazal vzorec pro převod z Celsia na Fahrenheity. Tvým úkolem je doplnit kód v prostředním uzlu podle vzorce: (vstup * 1.8) + 32.";

const initialNodes = [
  {
    id: 'n1',
    type: 'input',
    position: { x: X_START, y: Y_CENTER },
    data: { label: 'Senzor (°C)' },
    // 1. ZDROJ DAT (Zde je vše v pořádku)
    code: `# Nastavíme testovací teplotu
teplota = 20

print(f"Vstupní teplota: {teplota}°C")

return teplota`,
    ...nodeDefaults,
  },
  {
    id: 'n2',
    position: { x: X_START + GAP, y: Y_CENTER },
    data: { label: 'Procesor (CHYBA)' },
    // 2. ÚKOL PRO UŽIVATELE (Zde chybí logika)
    // input_value je proměnná, která přišla z minulého uzlu (20)
    code: `# TODO: Oprav tento kód!
# Vzorec pro Fahrenheity je: (input_value * 1.8) + 32

# Zde je chyba - momentálně vracíme jen nulu
vysledek = 0 

return vysledek`,
    ...nodeDefaults,
  },
  {
    id: 'n3',
    type: 'output',
    position: { x: X_START + GAP * 2, y: Y_CENTER },
    data: { label: 'Kontrola' },
    // 3. VALIDACE (Kontroluje, zda uživatel úkol splnil)
    code: `# Očekáváme, že 20°C bude 68°F
ocekavana_hodnota = 68.0

print(f"Tvůj výsledek: {input_value}°F")

if input_value == ocekavana_hodnota:
    print("✅ SKVĚLÉ! Oprava úspěšná.")
else:
    print(f"❌ CHYBA: Očekáváno {ocekavana_hodnota}, ale přišlo {input_value}.")
    print("Tip: Zkontroluj Funkci Procesor.")`,
    ...nodeDefaults,
  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'n1',
    target: 'n2',
    animated: true,
  },
  {
    id: 'e2-3',
    source: 'n2',
    target: 'n3',
    animated: true,
  }
];

export { initialNodes, initialEdges };
