/**
 * Spanish NIF/CIF/NIE validation — used to WARN, never to block (R-2 accepts
 * foreign operators whose identifiers do not match this shape).
 */
const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export type NifCheck = {
  normalized: string;
  valid: boolean;
  kind: "dni" | "nie" | "cif" | "unknown";
};

export function checkNif(input: string): NifCheck {
  const n = input
    .toUpperCase()
    .replace(/[\s.\-]/g, "")
    .trim();

  // DNI: 8 digits + control letter
  const dni = /^(\d{8})([A-Z])$/.exec(n);
  if (dni) {
    const expected = DNI_LETTERS[parseInt(dni[1], 10) % 23];
    return { normalized: n, valid: dni[2] === expected, kind: "dni" };
  }

  // NIE: [XYZ] + 7 digits + control letter
  const nie = /^([XYZ])(\d{7})([A-Z])$/.exec(n);
  if (nie) {
    const prefix = { X: "0", Y: "1", Z: "2" }[nie[1]]!;
    const expected = DNI_LETTERS[parseInt(prefix + nie[2], 10) % 23];
    return { normalized: n, valid: nie[3] === expected, kind: "nie" };
  }

  // CIF: letter + 7 digits + control (digit or letter)
  const cif = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(n);
  if (cif) {
    const digits = cif[2];
    let even = 0;
    let odd = 0;
    for (let i = 0; i < 7; i++) {
      const d = parseInt(digits[i], 10);
      if (i % 2 === 0) {
        const x = d * 2;
        odd += Math.floor(x / 10) + (x % 10);
      } else {
        even += d;
      }
    }
    const sum = even + odd;
    const control = (10 - (sum % 10)) % 10;
    const letterControl = "JABCDEFGHI"[control];
    const ok = cif[3] === String(control) || cif[3] === letterControl;
    return { normalized: n, valid: ok, kind: "cif" };
  }

  return { normalized: n, valid: false, kind: "unknown" };
}
