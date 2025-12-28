import Catalogo from "./Catalogo";
import CatalogoImage from "./CatalogoImage";
import CatalogoItem from "./CatalogoItem";
import User from "./User";

export function setupAssociations(): void {
  User.hasMany(Catalogo, { foreignKey: "userId", onDelete: "CASCADE" });
  Catalogo.belongsTo(User, { foreignKey: "userId" });

  Catalogo.hasMany(CatalogoImage, { foreignKey: "catalogId", onDelete: "CASCADE" });
  CatalogoImage.belongsTo(Catalogo, { foreignKey: "catalogId" });

  Catalogo.hasMany(CatalogoItem, { foreignKey: "catalogId", onDelete: "CASCADE" });
  CatalogoItem.belongsTo(Catalogo, { foreignKey: "catalogId" });
}
