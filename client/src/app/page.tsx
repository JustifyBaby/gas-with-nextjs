import { Button } from "@/components/ui/button";
import { HashMap } from "@/types/types";

export default async function Home() {
  const res = await fetch(String(process.env.API_URL));

  const sheetData: HashMap<string>[] = await res.json();

  return (
    <main className='flex flex-col justify-center items-center h-full'>
      <form className='flex flex-col justify-center items-center'>
        <ul>
          {sheetData.map((record, index) => (
            <li key={index} className='flex justify-center items-center'>
              <div className='m-2'>{record[""]}</div>
              <div className='m-2'>{record["単価"]}円</div>
              <select
                name={"piece" + index}
                className='p-1 m-2 bg-orange-50 text-lg border border-slate-600 rounded-lg'>
                {((stock: number) => {
                  let pieces: number[] = [];
                  for (let piece = 0; piece <= stock; piece++) {
                    pieces = [...pieces, piece];
                  }
                  return pieces;
                })(parseInt(record["在庫数"])).map((piece, index) => (
                  <option
                    key={index}
                    value={JSON.stringify(
                      (() => {
                        const key = record["商品名"];
                        const map: HashMap<number> = {};
                        map[key] = piece;
                        return map;
                      })()
                    )}>
                    {piece}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>

        <Button type='submit'>購入</Button>
      </form>
    </main>
  );
}
