import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembershipsModule } from './memberships/memberships.module';
import { Membership } from './memberships/entities/membership.entity';
import { Group } from './groups/entities/group.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    // TypeORM configuration with SQLite for development
    // For production, replace with PostgreSQL configuration using environment variables
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite', // File-based database (matches typeorm.config.ts)
      entities: [Membership, Group, User],
      synchronize: false, // NEVER use synchronize in production - use migrations instead
      logging: false,
      // Run migrations automatically on app startup (optional - remove in production)
      migrationsRun: process.env.NODE_ENV !== 'production',
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    MembershipsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
