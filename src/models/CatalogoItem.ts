import {
  CreationOptional,
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes
} from "sequelize";
import { sequelize } from "../config/database";

class CatalogoItem extends Model<
  InferAttributes<CatalogoItem, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<CatalogoItem, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<string>;
  declare catalogId: string;
  declare uuid: CreationOptional<string>;
  declare name: string;
  declare description: string | null;
  declare price: string | null;
  declare image: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

CatalogoItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    catalogId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    image: {
      type: DataTypes.STRING(1024),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "catalogo_items",
    timestamps: true
  }
);

export default CatalogoItem;
