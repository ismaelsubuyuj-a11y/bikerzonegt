/* Catálogo de referencia de OLT del mercado y perfiles de ONT.
   Valores típicos de referencia: confirme siempre con la hoja técnica del fabricante antes de diseñar. */
const CATALOGO_OLT = [
  {id: "hw-ma5800-x2", nombre: "Huawei MA5800-X2 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.0},
  {id: "hw-ma5800-x7", nombre: "Huawei MA5800-X7 · XGS-PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 5.0},
  {id: "zte-c320", nombre: "ZTE C320 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.5},
  {id: "zte-c620", nombre: "ZTE C620 · XGS-PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 5.0},
  {id: "nokia-fx16", nombre: "Nokia ISAM FX-16 · GPON", tecnologia: "GPON", puertosPON: 16, txDbm: 3.0},
  {id: "fh-an5516", nombre: "FiberHome AN5516-06 · GPON", tecnologia: "GPON", puertosPON: 8, txDbm: 3.0},
  {id: "gen-gpon-8", nombre: "Genérica GPON 8 PON", tecnologia: "GPON", puertosPON: 8, txDbm: 3.0},
  {id: "gen-xgs-16", nombre: "Genérica XGS-PON 16 PON", tecnologia: "XGS-PON", puertosPON: 16, txDbm: 4.0}
];

const PERFIL_ONT = {
  "B+": {nombre: "GPON clase B+ (−27 dBm)", sensDbm: -27},
  "C+": {nombre: "GPON clase C+ (−28 dBm)", sensDbm: -28},
  "XGS": {nombre: "XGS-PON (−28 dBm)", sensDbm: -28}
};

/* Pérdida típica de inserción de splitters PLC */
const SPLITTER_DB = {"1x2": 3.5, "1x4": 7.0, "1x8": 10.5, "1x16": 13.5, "1x32": 16.5};
