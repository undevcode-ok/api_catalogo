import { hashPassword } from "./utils/password";
import { sequelize } from "./config/database";
import User from "./models/User";
import Catalogo from "./models/Catalogo";
import CatalogoImage from "./models/CatalogoImage";

async function runSeed(): Promise<void> {
  const email = "admin@catalogo.com";
  const password = "admin123";

  await sequelize.authenticate();

  const existingUser = await User.findOne({ where: { email } });
  let user = existingUser;

  if (!user) {
    const passwordHash = await hashPassword(password);
    user = await User.create({
      email,
      passwordHash,
      role: "admin",
      provider: "local"
    });
  }

  const existingCatalogos = await Catalogo.findAll({ where: { userId: user.id } });
  if (existingCatalogos.length === 0) {
    const catalogos = await Catalogo.bulkCreate([
      {
        userId: user.id,
        title: "Catalogo Demo 1",
        description: "Demo catalogo 1",
        logoUrl: null,
        price: "10.00",
        backgroundColor: "#FFFFFF",
        isPublished: true
      },
      {
        userId: user.id,
        title: "Catalogo Demo 2",
        description: "Demo catalogo 2",
        logoUrl: null,
        price: "20.00",
        backgroundColor: "#F0F0F0",
        isPublished: false
      },
      {
        userId: user.id,
        title: "Catalogo Demo 3",
        description: "Demo catalogo 3",
        logoUrl: null,
        price: "30.00",
        backgroundColor: "#EFEFEF",
        isPublished: true
      }
    ]);

    const dummyUrls = [
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/jpg",
      "https://placehold.co/600x400/webp"
    ];

    const imagesPayload: Array<{ catalogId: string; imageUrl: string; sortOrder: number }> = [];

    for (const catalogo of catalogos) {
      dummyUrls.forEach((url, index) => {
        imagesPayload.push({
          catalogId: catalogo.id,
          imageUrl: url,
          sortOrder: index
        });
      });
    }

    await CatalogoImage.bulkCreate(imagesPayload);
  }

  console.log("Seed completo. Usuario admin:", { email, password });
}

runSeed()
  .then(() => {
    console.log("Seed finalizado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error en seed:", error);
    process.exit(1);
  });
