import {
  CreationOptional,
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes
} from "sequelize";
import { sequelize } from "../config/database";

class Catalogo extends Model<
  InferAttributes<Catalogo, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<Catalogo, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare title: string;
  declare description: string | null;
  declare logoUrl: string | null;
  declare backgroundColor: string | null;
  declare componentColor: string | null;
  declare isPublished: CreationOptional<boolean>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Catalogo.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    backgroundColor: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    componentColor: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    tableName: "catalogos",
    timestamps: true
  }
);

export default Catalogo;
