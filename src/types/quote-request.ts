/**
 * 見積もり依頼型定義
 */

/**
 * フロントエンド用の見積もり依頼型
 */
export interface QuoteRequest {
  id: string;
  customerLastName: string;
  customerFirstName: string;
  customerLastNameKana?: string;
  customerFirstNameKana?: string;
  customerEmail: string;
  customerPhone: string;
  fromPostalCode?: string;
  fromPrefecture: string;
  fromCity: string;
  fromAddressLine: string;
  fromBuildingType?: string;
  fromFloor?: number;
  fromHasElevator?: boolean;
  toPostalCode?: string;
  toPrefecture: string;
  toCity: string;
  toAddressLine: string;
  toBuildingType?: string;
  toFloor?: number;
  toHasElevator?: boolean;
  preferredDate1?: string;
  preferredTimeSlot1?: string;
  preferredDate2?: string;
  preferredTimeSlot2?: string;
  preferredDate3?: string;
  preferredTimeSlot3?: string;
  householdSize?: string;
  estimatedVolumeCbm?: number;
  packingRequired: boolean;
  hasFragileItems: boolean;
  hasLargeFurniture: boolean;
  specialRequirements?: string;
  accessRestrictions?: string;
  distanceKm?: number;
  estimatedDurationHours?: number;
  requestSource: string;
  referrerAgentId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * データベースから取得する見積もり依頼データの型（Prismaから）
 */
export interface QuoteRequestFromDB {
  id: string;
  customer_last_name: string;
  customer_first_name: string;
  customer_last_name_kana: string | null;
  customer_first_name_kana: string | null;
  customer_email: string;
  customer_phone: string;
  from_postal_code: string | null;
  from_prefecture: string;
  from_city: string;
  from_address_line: string;
  from_building_type: string | null;
  from_floor: number | null;
  from_has_elevator: boolean | null;
  to_postal_code: string | null;
  to_prefecture: string;
  to_city: string;
  to_address_line: string;
  to_building_type: string | null;
  to_floor: number | null;
  to_has_elevator: boolean | null;
  preferred_date_1: Date | string | null;
  preferred_time_slot_1: string | null;
  preferred_date_2: Date | string | null;
  preferred_time_slot_2: string | null;
  preferred_date_3: Date | string | null;
  preferred_time_slot_3: string | null;
  household_size: string | null;
  estimated_volume_cbm: number | string | null;
  packing_required: boolean;
  has_fragile_items: boolean;
  has_large_furniture: boolean;
  special_requirements: string | null;
  access_restrictions: string | null;
  distance_km: number | string | null;
  estimated_duration_hours: number | null;
  request_source: string;
  referrer_agent_id: string | null;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * 見積もり依頼作成用の入力型
 */
export interface CreateQuoteRequestInput {
  customer_last_name: string;
  customer_first_name: string;
  customer_last_name_kana?: string;
  customer_first_name_kana?: string;
  customer_email: string;
  customer_phone: string;
  from_postal_code?: string;
  from_prefecture: string;
  from_city: string;
  from_address_line: string;
  from_building_type?: string;
  from_floor?: number;
  from_has_elevator?: boolean;
  to_postal_code?: string;
  to_prefecture: string;
  to_city: string;
  to_address_line: string;
  to_building_type?: string;
  to_floor?: number;
  to_has_elevator?: boolean;
  preferred_date_1?: string;
  preferred_time_slot_1?: string;
  preferred_date_2?: string;
  preferred_time_slot_2?: string;
  preferred_date_3?: string;
  preferred_time_slot_3?: string;
  household_size?: string;
  estimated_volume_cbm?: number;
  packing_required?: boolean;
  has_fragile_items?: boolean;
  has_large_furniture?: boolean;
  special_requirements?: string;
  access_restrictions?: string;
  distance_km?: number;
  estimated_duration_hours?: number;
  request_source: string;
  referrer_agent_id?: string;
  status?: string;
}

/**
 * 見積もり依頼更新用の入力型
 */
export interface UpdateQuoteRequestInput {
  customer_last_name?: string;
  customer_first_name?: string;
  customer_last_name_kana?: string;
  customer_first_name_kana?: string;
  customer_email?: string;
  customer_phone?: string;
  from_postal_code?: string;
  from_prefecture?: string;
  from_city?: string;
  from_address_line?: string;
  from_building_type?: string;
  from_floor?: number;
  from_has_elevator?: boolean;
  to_postal_code?: string;
  to_prefecture?: string;
  to_city?: string;
  to_address_line?: string;
  to_building_type?: string;
  to_floor?: number;
  to_has_elevator?: boolean;
  preferred_date_1?: string;
  preferred_time_slot_1?: string;
  preferred_date_2?: string;
  preferred_time_slot_2?: string;
  preferred_date_3?: string;
  preferred_time_slot_3?: string;
  household_size?: string;
  estimated_volume_cbm?: number;
  packing_required?: boolean;
  has_fragile_items?: boolean;
  has_large_furniture?: boolean;
  special_requirements?: string;
  access_restrictions?: string;
  distance_km?: number;
  estimated_duration_hours?: number;
  request_source?: string;
  referrer_agent_id?: string;
  status?: string;
}

/**
 * DBデータをフロントエンド用に変換
 */
export function mapQuoteRequestFromDB(dbQuoteRequest: QuoteRequestFromDB): QuoteRequest {
  return {
    id: dbQuoteRequest.id,
    customerLastName: dbQuoteRequest.customer_last_name,
    customerFirstName: dbQuoteRequest.customer_first_name,
    customerLastNameKana: dbQuoteRequest.customer_last_name_kana || undefined,
    customerFirstNameKana: dbQuoteRequest.customer_first_name_kana || undefined,
    customerEmail: dbQuoteRequest.customer_email,
    customerPhone: dbQuoteRequest.customer_phone,
    fromPostalCode: dbQuoteRequest.from_postal_code || undefined,
    fromPrefecture: dbQuoteRequest.from_prefecture,
    fromCity: dbQuoteRequest.from_city,
    fromAddressLine: dbQuoteRequest.from_address_line,
    fromBuildingType: dbQuoteRequest.from_building_type || undefined,
    fromFloor: dbQuoteRequest.from_floor || undefined,
    fromHasElevator: dbQuoteRequest.from_has_elevator || undefined,
    toPostalCode: dbQuoteRequest.to_postal_code || undefined,
    toPrefecture: dbQuoteRequest.to_prefecture,
    toCity: dbQuoteRequest.to_city,
    toAddressLine: dbQuoteRequest.to_address_line,
    toBuildingType: dbQuoteRequest.to_building_type || undefined,
    toFloor: dbQuoteRequest.to_floor || undefined,
    toHasElevator: dbQuoteRequest.to_has_elevator || undefined,
    preferredDate1: dbQuoteRequest.preferred_date_1
      ? typeof dbQuoteRequest.preferred_date_1 === 'string'
        ? dbQuoteRequest.preferred_date_1
        : dbQuoteRequest.preferred_date_1.toISOString().split('T')[0]
      : undefined,
    preferredTimeSlot1: dbQuoteRequest.preferred_time_slot_1 || undefined,
    preferredDate2: dbQuoteRequest.preferred_date_2
      ? typeof dbQuoteRequest.preferred_date_2 === 'string'
        ? dbQuoteRequest.preferred_date_2
        : dbQuoteRequest.preferred_date_2.toISOString().split('T')[0]
      : undefined,
    preferredTimeSlot2: dbQuoteRequest.preferred_time_slot_2 || undefined,
    preferredDate3: dbQuoteRequest.preferred_date_3
      ? typeof dbQuoteRequest.preferred_date_3 === 'string'
        ? dbQuoteRequest.preferred_date_3
        : dbQuoteRequest.preferred_date_3.toISOString().split('T')[0]
      : undefined,
    preferredTimeSlot3: dbQuoteRequest.preferred_time_slot_3 || undefined,
    householdSize: dbQuoteRequest.household_size || undefined,
    estimatedVolumeCbm: dbQuoteRequest.estimated_volume_cbm
      ? typeof dbQuoteRequest.estimated_volume_cbm === 'string'
        ? parseFloat(dbQuoteRequest.estimated_volume_cbm)
        : dbQuoteRequest.estimated_volume_cbm
      : undefined,
    packingRequired: dbQuoteRequest.packing_required,
    hasFragileItems: dbQuoteRequest.has_fragile_items,
    hasLargeFurniture: dbQuoteRequest.has_large_furniture,
    specialRequirements: dbQuoteRequest.special_requirements || undefined,
    accessRestrictions: dbQuoteRequest.access_restrictions || undefined,
    distanceKm: dbQuoteRequest.distance_km
      ? typeof dbQuoteRequest.distance_km === 'string'
        ? parseFloat(dbQuoteRequest.distance_km)
        : dbQuoteRequest.distance_km
      : undefined,
    estimatedDurationHours: dbQuoteRequest.estimated_duration_hours || undefined,
    requestSource: dbQuoteRequest.request_source,
    referrerAgentId: dbQuoteRequest.referrer_agent_id || undefined,
    status: dbQuoteRequest.status,
    createdAt:
      typeof dbQuoteRequest.created_at === 'string'
        ? dbQuoteRequest.created_at
        : dbQuoteRequest.created_at.toISOString(),
    updatedAt:
      typeof dbQuoteRequest.updated_at === 'string'
        ? dbQuoteRequest.updated_at
        : dbQuoteRequest.updated_at.toISOString(),
  };
}

/**
 * フロントエンドデータをDB用に変換
 */
export function mapQuoteRequestToDB(
  quoteRequest: Omit<QuoteRequest, 'id' | 'createdAt' | 'updatedAt'>
): CreateQuoteRequestInput {
  return {
    customer_last_name: quoteRequest.customerLastName,
    customer_first_name: quoteRequest.customerFirstName,
    customer_last_name_kana: quoteRequest.customerLastNameKana,
    customer_first_name_kana: quoteRequest.customerFirstNameKana,
    customer_email: quoteRequest.customerEmail,
    customer_phone: quoteRequest.customerPhone,
    from_postal_code: quoteRequest.fromPostalCode,
    from_prefecture: quoteRequest.fromPrefecture,
    from_city: quoteRequest.fromCity,
    from_address_line: quoteRequest.fromAddressLine,
    from_building_type: quoteRequest.fromBuildingType,
    from_floor: quoteRequest.fromFloor,
    from_has_elevator: quoteRequest.fromHasElevator,
    to_postal_code: quoteRequest.toPostalCode,
    to_prefecture: quoteRequest.toPrefecture,
    to_city: quoteRequest.toCity,
    to_address_line: quoteRequest.toAddressLine,
    to_building_type: quoteRequest.toBuildingType,
    to_floor: quoteRequest.toFloor,
    to_has_elevator: quoteRequest.toHasElevator,
    preferred_date_1: quoteRequest.preferredDate1,
    preferred_time_slot_1: quoteRequest.preferredTimeSlot1,
    preferred_date_2: quoteRequest.preferredDate2,
    preferred_time_slot_2: quoteRequest.preferredTimeSlot2,
    preferred_date_3: quoteRequest.preferredDate3,
    preferred_time_slot_3: quoteRequest.preferredTimeSlot3,
    household_size: quoteRequest.householdSize,
    estimated_volume_cbm: quoteRequest.estimatedVolumeCbm,
    packing_required: quoteRequest.packingRequired,
    has_fragile_items: quoteRequest.hasFragileItems,
    has_large_furniture: quoteRequest.hasLargeFurniture,
    special_requirements: quoteRequest.specialRequirements,
    access_restrictions: quoteRequest.accessRestrictions,
    distance_km: quoteRequest.distanceKm,
    estimated_duration_hours: quoteRequest.estimatedDurationHours,
    request_source: quoteRequest.requestSource,
    referrer_agent_id: quoteRequest.referrerAgentId,
    status: quoteRequest.status,
  };
}

