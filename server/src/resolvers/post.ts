import { Resolver, Query, Arg, Int, Mutation } from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    const posts = await Post.find()
    return posts
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg("id", () => Int) id: number): Promise<Post | undefined> {
    const post = await Post.findOne(id)
    return post
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string): Promise<Post | undefined> {
    const post = await Post.create({ title }).save()
    return post
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string): Promise<Post | undefined> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title })
      .where('id = :id')
      .returning('*')
      .execute()

    return post.raw[0]
  }

  @Mutation(() => Post, { nullable: true })
  async deletePost(
    @Arg("id") id: number,
  ): Promise<boolean> {
    await Post.delete({ id })

    return true
  }
}
