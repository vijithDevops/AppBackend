import * as _ from 'lodash';
import * as hat from 'hat';

// Function returns a six digit random number
export const randomNumber = () => {
  // return Math.floor(Math.random() * 1000000);
  return Math.floor(100000 + Math.random() * 900000);
};

export const unixTime = () => {
  return Math.floor(Date.now() / 1000);
};

export const getGreatest = (num1: number, num2: number): number => {
  return num1 > num2 ? num1 : num2;
};

/**
 * To convert values of all keys of an object to string
 *
 * @param {Object} object
 * @returns {Object}
 */
export const convertObjectValueToString = (object: any) => {
  try {
    Object.keys(object).forEach((key) => {
      // if (typeof object[key] === 'object') {
      //   return convertObjectValueToString(object[key]);
      // }
      object[key] = object[key] ? object[key].toString() : '';
    });
    return object;
  } catch (error) {
    throw error;
  }
};
/**
 * Make array distinct
 *
 * @param {string[]} array
 * @returns {string[]}
 */
export const getDistinctArray = (array: string[]) => {
  try {
    return _.uniqBy(array, function (value) {
      return value;
    });
  } catch (error) {
    throw error;
  }
};
/**
 * Check object is Empty
 *
 * @param {object} object
 * @returns {boolean}
 */
export const checkObjectIsEmpty = (object: { [key: string]: any }): boolean => {
  try {
    return _.isEmpty(object);
  } catch (error) {
    throw error;
  }
};

/**
 * Check for valid URL
 *
 * @param {string} string
 * @returns {boolean}
 */
export const isValidHttpUrl = (string: string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

/**
 * Function to generate password of characterset [a-z,A-Z,0-9]
 *
 * @returns {string}
 */
export const generatePassword = () => {
  const length = 8,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

/**
 * Function to generate random token string
 *
 * @returns {string}
 */
export const generateTokenString = () => {
  return hat();
};

/**
 * Function to get unique string in an array
 *
 * @param {string[]} stringArray
 * @returns {string[]}
 */
export const getUniqueArrayStringValues = (stringArray: string[]) => {
  return stringArray.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

/**
 * Function to get unique number in an array
 *
 * @param {number[]} stringArray
 * @returns {number[]}
 */
export const getUniqueArrayNumberValues = (numberArray: number[]): number[] => {
  return numberArray.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
};

// /**
//  * Function to get unique array values
//  *
//  * @param {string[] | number[]} stringArray
//  * @returns {string[] | number[]}
//  */
// export const getUniqueArrayValues = (
//   values: string[] | number[],
// ): string[] | number[] => {
//   return values.filter((value, index, self) => {
//     return self.indexOf(value) === index;
//   });
// };

/**
 * Function to parse array of string values to use in SQL IN or NOT IN query
 *
 * @param {string[]} stringArray
 * @returns {string}
 */
export const parseArrayForSqlQuery = (stringArray: string[]) => {
  let returnString = '';
  stringArray.forEach((string, index) => {
    if (index > 0) {
      returnString = returnString + ',';
    }
    returnString = returnString + `'${string}'`;
  });
  return returnString;
};

// /**
//  * To convert any string to camel case
//  *
//  * @param {string} anyString
//  * @returns {string}
//  */
// export const toCamelCase = (anyString: string): string => {
//   return anyString
//     .replace(/_+/g, ' ')
//     .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
//       // return index === 0 ? word.toLowerCase() : word.toUpperCase();
//       if (+word === 0) return ''; // or if (/\s+/.test(match)) for white spaces
//       return index === 0 ? word.toLowerCase() : word.toUpperCase();
//     })
//     .replace(/\s+/g, '');
// };
