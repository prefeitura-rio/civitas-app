/* eslint-disable jsx-a11y/alt-text */
import { Image, View } from '@react-pdf/renderer'

import watermark from '@/assets/civitas-blue-logomark.jpg'

export function Watermark() {
  return (
    <View
      style={{
        marginHorizontal: 30,
        marginVertical: 40,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 40,
      }}
      fixed
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          src={watermark.src}
          style={{
            opacity: 0.05,
            width: 400,
            height: 'auto',
          }}
        />
      </View>
    </View>
  )
}
