import { Module } from '@nestjs/common'
import { IHashProvider } from './infrastructure/providers/hash/i-hash.provider'
import { BcryptHashProvider } from './infrastructure/providers/hash/bcrypt-hash.provider'

@Module({
  providers: [
    {
      provide: IHashProvider,
      useClass: BcryptHashProvider,
    },
  ],
  exports: [IHashProvider], // Export the provider for other modules to use
})
export class HashModule {}
