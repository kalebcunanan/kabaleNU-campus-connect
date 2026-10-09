// Valid program codes per student type, shared by the model and the controllers.
const SHS_PROGRAMS = ['STEM_CT', 'AHSS_EASS', 'STEM_EA', 'BUEN_MA', 'STEM_SAH'];

const COLLEGE_PROGRAMS = [
  'BAComm', 'BAPolSci', 'BSPsy',
  'BSAccountancy', 'BSBA-MktgMgmt-MNL', 'BSMA', 'BSTM',
  'BSArch-MNL', 'BSCS', 'BSIT-MNL',
  'BSCE', 'BSCpE-MNL',
  'BSMT', 'DMD',
];

const PROGRAMS_BY_ROLE = { bullpup: SHS_PROGRAMS, bulldog: COLLEGE_PROGRAMS };

const ALL_PROGRAMS = [...SHS_PROGRAMS, ...COLLEGE_PROGRAMS];

const isValidProgram = (role, program) => (PROGRAMS_BY_ROLE[role] || []).includes(program);

module.exports = { ALL_PROGRAMS, isValidProgram };