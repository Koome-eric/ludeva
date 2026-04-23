import { Server } from "socket.io";
import pkg from "mongodb";

const { MongoClient, ServerApiVersion } = pkg;

const MONGO_URI = process.env.DATABASE_URL;

// ✅ Global cache (prevents hot reload duplication)
const globalWithMongo = global as typeof globalThis & {
  mongoClient?: pkg.MongoClient;
  watchersInitialized?: boolean;
};

async function getMongoClient(): Promise<pkg.MongoClient> {
  if (globalWithMongo.mongoClient) {
    return globalWithMongo.mongoClient;
  }

  if (!MONGO_URI) {
    throw new Error("❌ DATABASE_URL environment variable is not set.");
  }

  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  globalWithMongo.mongoClient = client;

  for (let i = 0; i < 3; i++) {
    try {
      await client.connect();
      console.log("✅ Connected to MongoDB");
      return client;
    } catch (err) {
      console.warn(`⚠️ MongoDB connection attempt ${i + 1} failed. Retrying in 2s...`);

      if (i === 2) {
        globalWithMongo.mongoClient = undefined;
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("❌ Could not connect to MongoDB.");
}

export async function initRealtime(io: Server) {
  if (globalWithMongo.watchersInitialized) {
    console.log("✅ Change stream watchers already initialized.");
    return;
  }

  try {
    const client = await getMongoClient();
    const db = client.db();

    console.log("✅ Initializing MongoDB Change Streams...");

    const watchCollection = (collectionName: string, eventKey: string, targetRole?: string) => {
      const collection = db.collection(collectionName);

      const changeStream = collection.watch([], {
        fullDocument: "updateLookup",
      });

      changeStream.on("change", (change: pkg.ChangeStreamDocument) => {

        // ✅ Only handle operations that actually contain documentKey
        if (
          change.operationType !== "insert" &&
          change.operationType !== "update" &&
          change.operationType !== "replace" &&
          change.operationType !== "delete"
        ) {
          return;
        }

        const id = change.documentKey?._id;

        if (!id) return;

        let doc: any = null;

        if (change.operationType === "insert") {
          doc = (change as pkg.ChangeStreamInsertDocument).fullDocument;
        }

        if (change.operationType === "replace") {
          doc = (change as pkg.ChangeStreamReplaceDocument).fullDocument;
        }

        if (change.operationType === "update") {
          doc = (change as pkg.ChangeStreamUpdateDocument).fullDocument;
        }

        if (change.operationType === "delete") {
          doc = { _id: id };
        }

        const payload = {
          operation: change.operationType,
          data: doc,
          id,
          collection: collectionName,
        };

        // ✅ Smart routing logic
        if (["investment", "transaction"].includes(collectionName)) {

          io.to("ADMIN").emit(eventKey, payload);

          const userId = doc?.userId || doc?.user?.id;

          if (userId) {
            io.to(`user:${userId}`).emit(eventKey, payload);
          }

        } else if (targetRole) {

          io.to(targetRole).emit(eventKey, payload);

        } else {

          io.emit(eventKey, payload);
        }
      });

      changeStream.on("error", (error) => {
        console.error(`❌ Change Stream error on ${collectionName}:`, error);
      });

      console.log(`   -> Watching collection: ${collectionName}`);
    };

    watchCollection("user", "user:update", "ADMIN");
    watchCollection("announcement", "announcement:update", "MEMBER");
    watchCollection("investmentproduct", "product:update", "MEMBER");
    watchCollection("investment", "investment:update");
    watchCollection("transaction", "transaction:update");

    globalWithMongo.watchersInitialized = true;

    console.log("✅ Change Streams Active");

  } catch (err) {
    console.error("❌ Failed to initialize MongoDB Change Streams:", err);
  }
}
