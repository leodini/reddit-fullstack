import { Resolver, Query, Mutation, InputType, Field, Arg } from "type-graphql";
import { User } from "../entities/User";
import argon2 from 'argon2'

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg('options') options: UsernamePasswordInput
    ): Promise<User | undefined> {
        const hashedPassword = await argon2.hash(options.password)

        const newUser = await User.create({ username: options.username, password: hashedPassword }).save()
        console.log(newUser)
        return newUser
    }

    @Mutation(() => User)
    async login(
        @Arg('options') options: UsernamePasswordInput
    ) {

    }

}
