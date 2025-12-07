/**
 * Custom Attributes Types
 * 
 * Types for custom attributes and flexible metadata.
 */

export type CustomAttributeValueType = 'string' | 'number' | 'boolean' | 'date' | 'json';

export interface CustomAttributeBase {
  entity_type: string;
  entity_id: string;
  attribute_key: string;
  attribute_value: string | number | boolean | Record<string, any> | any[];
  value_type: CustomAttributeValueType;
}

export interface CustomAttributeCreate extends CustomAttributeBase {
  owner_id: string;
}

export interface CustomAttributeUpdate {
  attribute_value?: string | number | boolean | Record<string, any> | any[];
  value_type?: CustomAttributeValueType;
}

export interface CustomAttributeRead extends CustomAttributeBase {
  attribute_id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomAttributeListResponse {
  attributes: CustomAttributeRead[];
  total: number;
  page: number;
  page_size: number;
}

export interface CustomAttributesQueryParams {
  page?: number;
  page_size?: number;
  limit?: number; // Alias for page_size for backward compatibility
  entity_type?: string;
  entity_id?: string;
  attribute_key?: string;
  search?: string;
}
