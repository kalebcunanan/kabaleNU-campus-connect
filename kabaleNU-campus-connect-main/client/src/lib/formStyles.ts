// Shared field styling so Input and Select always look identical.
export const getFieldClasses = (hasError: boolean): string =>
  `block w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-nu-gold ${
    hasError ? 'border-red-500' : 'border-gray-300 focus:border-nu-blue'
  }`;
