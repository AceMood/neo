/* @flow */

/**
 * define a property on a given object, when object should not be modified by outer programme
 * @param obj host object
 * @param key property name
 * @param val property value
 * @param enumerable whether the property can be enumerable
 */
export function defImmutableProp(obj: Object, key: string, val: mixed, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    enumerable: !!enumerable,
    writable: false,
    configurable: false,
    value: val
  })
};

/**
 * define a property on a given object
 * @param obj host object
 * @param key property name
 * @param descriptor
 */
export function def(obj: Object, key: string, descriptor: object) {
  Object.defineProperty(obj, key, descriptor)
};