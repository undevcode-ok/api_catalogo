import {
  CreationOptional,
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes
} from "sequelize";
import { sequelize } from "../config/database";

class CatalogoImage extends Model<
  InferAttributes<CatalogoImage, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<CatalogoImage, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<string>;
  declare catalogId: string;
  declare imageUrl: string;
  declare sortOrder: CreationOptional<number>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

CatalogoImage.init(
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
    imageUrl: {
      type: DataTypes.STRING(1024),
      allowNull: false
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: "catalogo_images",
    timestamps: true
  }
);

export default CatalogoImage;
