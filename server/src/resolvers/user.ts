import {
  Resolver,
  Query,
  Mutation,
  InputType,
  Field,
  Arg,
  ObjectType,
  Ctx,
} from "type-graphql";
import { User } from "../entities/User";
import argon2 from "argon2";
import { MyContext } from "../types";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    const { userId } = req.session;

    if (!userId) {
      return null;
    }

    const user = await User.findOne({ id: userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse | undefined> {
    if (options.username.length <= 3) {
      return {
        errors: [
          {
            field: "username",
            message: "lenght must be greater than 3",
          },
        ],
      };
    }

    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "lenght must be greater than 3",
          },
        ],
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    try {
      const newUser = await User.create({
        username: options.username,
        password: hashedPassword,
      }).save();

      //set a cookie on the user
      //keep them logged in
      req.session.userId = newUser.id;

      return { user: newUser };
    } catch (error) {
      //checking if user already exists
      if (error.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "already exists",
            },
          ],
        };
      }

      return error;
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username: options.username } });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username doesn't exist",
          },
        ],
      };
    }

    const validPassword = await argon2.verify(user.password, options.password);

    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return { user };
  }
}
