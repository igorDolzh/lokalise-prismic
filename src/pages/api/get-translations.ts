import { LokaliseApi, Language } from '@lokalise/node-api'
import type { NextApiRequest, NextApiResponse } from 'next'
import * as https from 'https'
import JSZip from 'jszip'
import fetch from 'node-fetch'
import AdmZip from 'adm-zip'

// const getZipFile = async (fileUrl: string) => {
//   const data = await fetch(fileUrl) // 1) fetch the url
//     .then(function (response) {
//       // 2) filter on 200 OK
//       console.log(response);
//       if (response.status === 200 || response.status === 0) {
//         return Promise.resolve(response.blob());
//       } else {
//         return Promise.reject(new Error(response.statusText));
//       }
//     });

//   const zip = await JSZip.loadAsync(data);
//   return zip;

//   return new Promise((resolve, reject) => {
//     const req = https.get(fileUrl, async (res) => {
//       const data = [] as any;
//       let totalDataLength = 0;

//       //   res
//       //     .on("data", (chunk) => {
//       //       data.push(chunk);
//       //       totalDataLength += chunk.length;
//       //     })
//       //     .on("end", async () => {
//       //       try {
//       //         const buf = Buffer.alloc(totalDataLength);
//       //         for (let i = 0, len = data.length, pos = 0; i < len; i++) {
//       //           data[i].copy(buf, pos);
//       //           pos += data[i].length;
//       //         }

//       //         const zip = await JSZip.loadAsync(res);
//       //         resolve(zip);
//       //       } catch (e) {
//       //         reject(e);
//       //       }
//       //     });
//       // });

//       const req = https.get(fileUrl, async (response) => {
//         console.log(response);
//         //const zip = await JSZip.loadAsync(response.);
//         resolve("hello");
//       });

//       req.on("error", (err) => {
//         reject(err);
//       });
//     });
//   });
// };

const getZipFile = (fileUrl: string): Promise<AdmZip> => {
  return new Promise((resolve, reject) => {
    const req = https.get(fileUrl, async (res) => {
      const data = [] as any
      let totalDataLength = 0

      res
        .on('data', (chunk) => {
          data.push(chunk)
          totalDataLength += chunk.length
        })
        .on('end', async () => {
          try {
            const buf = Buffer.alloc(totalDataLength)
            for (let i = 0, len = data.length, pos = 0; i < len; i++) {
              data[i].copy(buf, pos)
              pos += data[i].length
            }

            const zip = new AdmZip(buf)
            resolve(zip)
          } catch (e) {
            reject(e)
          }
        })
    })

    req.on('error', (err) => {
      reject(err)
    })
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const translations: any[] = []
  const params = req.query
  console.log('params', params)
  const languageParam = params.language
  const projectId = params.projectId

  const lokalise = new LokaliseApi({
    apiKey: params.token as string,
  })
  if (!projectId) {
    return
  }
  const file = await lokalise.files().download(projectId as string, {
    format: 'json',
    filter_langs: [languageParam as string],
    export_sort: 'first_added',
    replace_breaks: false,
    original_filenames: false,
    export_empty_as: 'skip',
  })
  console.log('file', file)

  const zipUrl = file.bundle_url
  const zip = await getZipFile(zipUrl)
  const zipEntries = zip.getEntries()

  for (let i = 0; i < zipEntries.length; i++) {
    if (zipEntries[i].entryName.match(/[a-z]*\.[a-z]*$/)) {
      try {
        translations.push({
          file: zipEntries[i].entryName,
          translations: JSON.parse(zip.readAsText(zipEntries[i])),
        })
        //writeFileRecursive(zipEntries[i].entryName, zip.readAsText(zipEntries[i]))
        console.log(`SUCCESS for ${zipEntries[i].entryName}`)
      } catch (err) {
        console.log(`ERROR for ${zipEntries[i].entryName}`)
        console.log(err)
      }
    }
  }

  res.status(200).json({ response: translations })
}
