import { describe, it, expect } from "vitest";
import { parseGedcomBuffer } from "../ged-parser";

const MINIMAL_GED = `0 HEAD
1 CHAR ANSEL
0 @1I@ INDI
1 NAME Marie/DUPONT/
2 GIVN Marie
2 SURN DUPONT
1 SEX F
1 BIRT
2 DATE 14 MAR 1842
2 PLAC Lille,59,Nord,,FRANCE,
1 DEAT
2 DATE 5 JUN 1910
2 PLAC Paris,75,Seine,,FRANCE,
1 OCCU tisserande
1 FAMS @100U@
1 FAMC @200U@
0 @2I@ INDI
1 NAME Jean/DUPONT/
2 GIVN Jean
2 SURN DUPONT
1 SEX M
1 BIRT
2 DATE 1815
2 _FNA YES
1 FAMS @100U@
0 @100U@ FAM
1 HUSB @2I@
1 WIFE @1I@
1 CHIL @3I@
1 MARR
2 DATE 10 JAN 1840
2 PLAC Lille,59,Nord,,FRANCE,
0 TRLR`;

async function parse(gedText: string) {
  return parseGedcomBuffer(Buffer.from(gedText, "utf8"));
}

describe("parseGedcomBuffer", () => {
  it("parses individuals count", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    expect(individuals.size).toBe(2);
  });

  it("parses given and family name", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    const marie = individuals.get("1I");
    expect(marie?.given_name).toBe("Marie");
    expect(marie?.family_name).toBe("DUPONT");
  });

  it("parses sex", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    expect(individuals.get("1I")?.sex).toBe("F");
    expect(individuals.get("2I")?.sex).toBe("M");
  });

  it("parses birth event", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    const marie = individuals.get("1I");
    const birth = marie?.events.find((e) => e.kind === "birt");
    expect(birth?.date?.raw).toBe("14 MAR 1842");
    expect(birth?.date?.approximate).toBe(false);
    expect(birth?.place).toBe("Lille,59,Nord,,FRANCE,");
  });

  it("marks approximate dates", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    const jean = individuals.get("2I");
    const birth = jean?.events.find((e) => e.kind === "birt");
    expect(birth?.date?.raw).toBe("1815");
    expect(birth?.date?.approximate).toBe(false);
  });

  it("parses occupation", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    const marie = individuals.get("1I");
    expect(marie?.occupation).toBe("tisserande");
  });

  it("parses family references", async () => {
    const { individuals } = await parse(MINIMAL_GED);
    const marie = individuals.get("1I");
    expect(marie?.fams).toContain("100U");
    expect(marie?.famc).toContain("200U");
  });

  it("parses family count", async () => {
    const { families } = await parse(MINIMAL_GED);
    expect(families.size).toBe(1);
  });

  it("parses family members", async () => {
    const { families } = await parse(MINIMAL_GED);
    const fam = families.get("100U");
    expect(fam?.husband).toBe("2I");
    expect(fam?.wife).toBe("1I");
    expect(fam?.children).toContain("3I");
  });

  it("parses marriage event from family", async () => {
    const { families } = await parse(MINIMAL_GED);
    const fam = families.get("100U");
    const marr = fam?.events.find((e) => e.kind === "marr");
    expect(marr?.date?.raw).toBe("10 JAN 1840");
    expect(marr?.place).toBe("Lille,59,Nord,,FRANCE,");
  });
});

describe("parseGedcomBuffer — BEF/AFT dates", () => {
  const gedWithApprox = `0 @1I@ INDI
1 NAME Test/TEST/
1 DEAT
2 DATE BEF 1900
0 TRLR`;

  it("marks BEF dates as approximate", async () => {
    const { individuals } = await parse(gedWithApprox);
    const person = individuals.get("1I");
    const death = person?.events.find((e) => e.kind === "deat");
    expect(death?.date?.approximate).toBe(true);
    expect(death?.date?.raw).toBe("BEF 1900");
  });
});
