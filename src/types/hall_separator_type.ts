export enum HallTypesSeparator {
  SPORTHALL = "SPORTHALL",
  BILLIARDHALL = "BILLIARDHALL",
  BOWLINGHALL = "BOWLINGHALL",
  COMPUTERGAMESHALL = "COMPUTERGAMEHALL",
  PLAYSTATIONHALL = "PLAYSTATIONHALL",
}

export enum HallDetailSeparator {
  DETAILS = "details",
  AMENTITIES = "amentities",
  REVIEW = "review",
}
export type HallDetailStringValue = `${HallDetailSeparator}`;

export type HallTypeStringValue = `${HallTypesSeparator}`;
