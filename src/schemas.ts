import { object, string, number, array, boolean } from 'zod';

export const cdekTokenSchema = object({
  access_token: string(),
  expires_in: number(),
}).required();

export const regionSchema = object({
  region: string(),
  region_code: number(),
}).required();

export const citySchema = object({
  code: number(),
  city: string(),
  region: string(),
  region_code: number(),
  longitude: number(),
  latitude: number(),
}).required();

export const pointSchema = object({
  code: string().max(10),
  uuid: string().uuid(),
  name: string(),
  location: object({
    region_code: number(),
    city_code: number(),
    longitude: number(),
    latitude: number(),
    address: string(),
    address_full: string(),
  }),
  address_comment: string().optional().nullable(),
  nearest_station: string().optional().nullable(),
  nearest_metro_station: string().optional().nullable(),
  work_time: string(),
  phones: array(
    object({
      number: string(),
      additional: string().optional().nullable(),
    }).required(),
  ),
  email: string().optional().nullable(),
  note: string().optional().nullable(),
  type: string(),
  owner_code: string(),
  take_only: boolean(),
  is_handout: boolean(),
  is_reception: boolean(),
  is_dressing_room: boolean(),
  have_cashless: boolean(),
  have_cash: boolean(),
  have_fast_payment_system: boolean(),
  allowed_cod: boolean(),
  is_ltl: boolean().optional().nullable(),
  fulfillment: boolean().optional().nullable(),
  site: string().optional().nullable(),
  work_time_list: array(
    object({
      day: number(),
      time: string(),
    }).required(),
  ),
  work_time_exception_list: array(
    object({
      date_start: string(),
      date_end: string(),
      time_start: string().optional().nullable(),
      time_end: string().optional().nullable(),
      is_working: boolean(),
    }).required(),
  )
    .optional()
    .nullable(),
  weight_min: number().optional().nullable(),
  weight_max: number().optional().nullable(),
  dimensions: array(
    object({
      width: number(),
      height: number(),
      depth: number(),
    }).required(),
  )
    .optional()
    .nullable(),
})
  .required()
  .transform((point) => ({
    code: point.code,
    uuid: point.uuid,
    name: point.name,
    region_code: point.location.region_code,
    city_code: point.location.city_code,
    longitude: point.location.longitude,
    latitude: point.location.latitude,
    address: point.location.address,
    address_full: point.location.address_full,
    address_comment: point.address_comment,
    nearest_station: point.nearest_station,
    nearest_metro_station: point.nearest_metro_station,
    phones: point.phones, // JSON column
    email: point.email,
    note: point.note,
    type: point.type,
    owner_code: point.owner_code,
    take_only: point.take_only,
    is_handout: point.is_handout,
    is_reception: point.is_reception,
    is_dressing_room: point.is_dressing_room,
    have_cashless: point.have_cashless,
    have_cash: point.have_cash,
    have_fast_payment_system: point.have_fast_payment_system,
    allowed_cod: point.allowed_cod,
    is_ltl: point.is_ltl,
    fulfillment: point.fulfillment,
    site: point.site,
    work_time: point.work_time,
    work_time_list: point.work_time_list, // JSON column
    work_time_exception_list: point.work_time_exception_list ?? undefined, // JSON column
    weight_min: point.weight_min,
    weight_max: point.weight_max,
    dimensions: point.dimensions ?? undefined, // JSON column
  }));
