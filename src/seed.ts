import "dotenv/config";
import { hashPassword } from "./utils/password";
import { sequelize } from "./config/database";
import User from "./models/User";
import Catalogo from "./models/Catalogo";
import CatalogoImage from "./models/CatalogoImage";
import CatalogoItem from "./models/CatalogoItem";

async function runSeed(): Promise<void> {
  const email = "admin@catalogo.com";
  const password = "admin123";

  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

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
        backgroundColor: "#FFFFFF",
        componentColor: "#F2BADE",
        isPublished: true
      },
      {
        userId: user.id,
        title: "Catalogo Demo 2",
        description: "Demo catalogo 2",
        logoUrl: null,
        backgroundColor: "#F0F0F0",
        componentColor: "#9CE9D9",
        isPublished: false
      },
      {
        userId: user.id,
        title: "Catalogo Demo 3",
        description: "Demo catalogo 3",
        logoUrl: null,
        backgroundColor: "#EFEFEF",
        componentColor: "#F3DAB2",
        isPublished: true
      }
    ]);

    const dummyUrls = [
      "https://placehold.co/600x400/png",
      "https://placehold.co/600x400/jpg",
      "https://placehold.co/600x400/webp"
    ];

    const imagesPayload: Array<{ catalogId: string; imageUrl: string; sortOrder: number }> = [];
    const itemsPayload: Array<{
      catalogId: string;
      name: string;
      description: string;
      price: string;
      image: string;
      sortOrder: number;
    }> = [];

    for (const catalogo of catalogos) {
      dummyUrls.forEach((url, index) => {
        imagesPayload.push({
          catalogId: catalogo.id,
          imageUrl: url,
          sortOrder: index
        });
      });
      itemsPayload.push(
        {
          catalogId: catalogo.id,
          name: "Silla Comedor",
          description: "Silla de madera con asiento tapizado.",
          price: "42.90",
          image: "https://placehold.co/400x300.png",
          sortOrder: 10000
        },
        {
          catalogId: catalogo.id,
          name: "Silla Oficina Mesh",
          description: "Respaldo de malla transpirable.",
          price: "95.00",
          image: "https://placehold.co/400x300.png",
          sortOrder: 20000
        }
      );
    }

    await CatalogoImage.bulkCreate(imagesPayload);
    await CatalogoItem.bulkCreate(itemsPayload);
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
