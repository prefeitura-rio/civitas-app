// CRC32C (Castagnoli) Implementation
// Polynomial: 0x82F63B78

const POLY = 0x82f63b78
let crcTable: Int32Array | undefined

function makeTable() {
  crcTable = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ POLY : c >>> 1
    }
    crcTable[n] = c
  }
}

function crc32c(data: Uint8Array, initial = 0): number {
  if (!crcTable) makeTable()
  let crc = initial ^ -1
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable![(crc ^ data[i]) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

export async function calculateCRC32C(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024 // 2MB chunks
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    let checksum = 0 // Initial seed

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      if (!e.target?.result) return

      const arrayBuffer = e.target.result as ArrayBuffer
      const data = new Uint8Array(arrayBuffer)

      checksum = crc32c(data, checksum)
      currentChunk++

      if (currentChunk < chunks) {
        loadNext()
      } else {
        // Convert to Big Endian bytes for GCS
        const buffer = new ArrayBuffer(4)
        const view = new DataView(buffer)
        view.setUint32(0, checksum, false) // Big Endian

        // Convert to Base64
        const base64Checksum = btoa(
          String.fromCharCode(...new Uint8Array(buffer)),
        )
        resolve(base64Checksum)
      }
    }

    fileReader.onerror = () =>
      reject(new Error('Erro ao ler arquivo para CRC32C'))

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const blob = file.slice(start, end)
      fileReader.readAsArrayBuffer(blob)
    }

    loadNext()
  })
}
