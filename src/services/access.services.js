'use strict'

const { createTokenPair } = require("../auth/authUtils")
const shopModel = require("../models/shop.model")
const keyTokenService = require('./keyToken.services')
const { getIntoData } = require('../utils')

const bcrypt = require("bcrypt")
const crypto = require("crypto")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            // step1: check email exists??

            const hodelShop = await shopModel.findOne({ email }).lean()

            if (hodelShop) {
                return {
                    code: 'xxxx',
                    message: 'Shop already exists',
                }
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // created privateKey, publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096,
                    publicKeyEncoding: {
                        type: 'pkcs1', // pkcs8
                        format: 'pem'
                    },
                    privateKeyEncoding: {
                        type: 'pkcs1',
                        format: 'pem'
                    }
                })

                console.log({ privateKey, publicKey }) //save collection KeyStore
                const publicKeyString = keyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey
                })

                if (!publicKeyString) {
                    return {
                        code: 'xxxx',
                        message: 'Failed to create key token',
                    }
                }

                const publicKeyObject = crypto.createPublicKey(publicKeyString)
                console.log(`Public Key Object`, publicKeyObject)
                const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyObject, privateKey)
                console.log(`Created Token Success`, tokens)

                return {
                    code: 201,
                    metadata: {
                        shop: getIntoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                        tokens
                    }
                }
            }

            return {
                code: 200,
                metadata: null
            }

        } catch (error) {
            return {
                code: 'xxx',
                message: error.message || 'An error occurred during signup',
                status: 'error'
            }
        }
    }
}

module.exports = AccessService