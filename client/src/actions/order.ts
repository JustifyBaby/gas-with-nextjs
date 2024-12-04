"use server";

import { HashMap } from "@/types/types";

export const orderAction = async (fd: FormData, length: number) => {
  const pieceList: HashMap = {};

  for (let id = 0; id < length; id++) {
    const piece = fd.get("piece" + id)!.toString();
    const parsedIt: HashMap = JSON.parse(piece);
    pieceList[Object.keys(parsedIt)[0]] = Object.values(parsedIt)[0];
  }

  await fetch(String(process.env.API_URL), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pieceList),
  }).catch((e) => console.log(e));
};
