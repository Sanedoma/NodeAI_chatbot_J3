import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function getIndexInfo(){
    const res = await fetch(
        `https://api.pinecone.io/indexes/${process.env.PINECONE_INDEX_NAME}`,
        {
            headers: {
                "Api-Key": process.env.PINECONE_API_KEY
            }
        }
    );

    const data = await res.json();
    console.log(data);
}

getIndexInfo();