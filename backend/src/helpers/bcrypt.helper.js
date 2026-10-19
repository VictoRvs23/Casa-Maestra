"use strict";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const encryptPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};