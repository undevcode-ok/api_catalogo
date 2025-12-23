import {
  CreationOptional,
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes
} from "sequelize";
import { sequelize } from "../config/database";

class User extends Model<
  InferAttributes<User, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<User, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare passwordHash: string | null;
  declare role: CreationOptional<"free" | "premium" | "admin">;
  declare provider: CreationOptional<"local" | "google">;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM("free", "premium", "admin"),
      allowNull: false,
      defaultValue: "free"
    },
    provider: {
      type: DataTypes.ENUM("local", "google"),
      allowNull: false,
      defaultValue: "local"
    }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true
  }
);

export default User;
