// Role-Tenure-Template Mapping System
export interface RoleTenureMapping {
  [roleCode: string]: {
    name: string
    availableTenures: number[] // months
    templates: {
      [months: number]: string // template code
    }
  }
}

export const ROLE_TENURE_MAPPING: RoleTenureMapping = {
  'SM': {
    name: 'Sales & Marketing',
    availableTenures: [2, 4], // 2M, 4M
    templates: {
      2: 'SM_2M',
      4: 'SM_4M'
    }
  },
  'TA': {
    name: 'Talent Acquisition',
    availableTenures: [1, 2, 4], // 1M, 2M, 4M
    templates: {
      1: 'TA_1M',
      2: 'TA_2M',
      4: 'TA_4M'
    }
  },
  'TASM': {
    name: 'Talent Acquisition Sales & Marketing Combined',
    availableTenures: [2, 4], // 2M, 4M
    templates: {
      2: 'TASM_2M',
      4: 'TASM_4M'
    }
  }
}

// Get available tenures for a role
export function getAvailableTenuresForRole(roleCode: string): number[] {
  return ROLE_TENURE_MAPPING[roleCode]?.availableTenures || []
}

// Get template code for role and tenure
export function getTemplateCode(roleCode: string, months: number): string | null {
  return ROLE_TENURE_MAPPING[roleCode]?.templates[months] || null
}

// Get all role codes
export function getAllRoleCodes(): string[] {
  return Object.keys(ROLE_TENURE_MAPPING)
}

// Get role name by code
export function getRoleName(roleCode: string): string {
  return ROLE_TENURE_MAPPING[roleCode]?.name || roleCode
}
