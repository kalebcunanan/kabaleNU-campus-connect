import type { SelectOption } from '../components/common/Select';

export type StudentRole = 'bulldog' | 'bullpup';

const SHS_OPTIONS: SelectOption[] = [
  { value: 'STEM_CT', label: 'Computing and Technologies (STEM_CT)' },
  { value: 'AHSS_EASS', label: 'Education, Arts and Social Sciences (AHSS_EASS)' },
  { value: 'STEM_EA', label: 'Engineering and Architecture (STEM_EA)' },
  { value: 'BUEN_MA', label: 'Management and Accountancy (BUEN_MA)' },
  { value: 'STEM_SAH', label: 'Sciences and Allied Health (STEM_SAH)' },
];

const COLLEGE_OPTIONS: SelectOption[] = [
  { value: 'BAComm', label: 'SEAS - BA in Communication (BAComm)' },
  { value: 'BAPolSci', label: 'SEAS - BA in Political Science (BAPolSci)' },
  { value: 'BSPsy', label: 'SEAS - BS in Psychology (BSPsy)' },
  { value: 'BSAccountancy', label: 'SABM - BS in Accountancy (BSAccountancy)' },
  { value: 'BSBA-MktgMgmt-MNL', label: 'SABM - BSBA Marketing Management (BSBA-MktgMgmt-MNL)' },
  { value: 'BSMA', label: 'SABM - BS in Management Accounting (BSMA)' },
  { value: 'BSTM', label: 'SABM - BS in Tourism Management (BSTM)' },
  { value: 'BSArch-MNL', label: 'SATC - BS in Architecture (BSArch-MNL)' },
  { value: 'BSCS', label: 'SATC - BS in Computer Science, AI (BSCS)' },
  { value: 'BSIT-MNL', label: 'SATC - BS in Information Technology, Mobile and Web (BSIT-MNL)' },
  { value: 'BSCE', label: 'SENG - BS in Civil Engineering (BSCE)' },
  { value: 'BSCpE-MNL', label: 'SENG - BS in Computer Engineering (BSCpE-MNL)' },
  { value: 'BSMT', label: 'SDAH - BS in Medical Technology (BSMT)' },
  { value: 'DMD', label: 'SDAH - Doctor of Dental Medicine (DMD)' },
];

export const PROGRAMS_BY_ROLE: Record<StudentRole, SelectOption[]> = {
  bullpup: SHS_OPTIONS,
  bulldog: COLLEGE_OPTIONS,
};