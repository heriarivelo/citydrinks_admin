import { AxiosInstance } from 'axios'
import 'pinia'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $axios: AxiosInstance
  }
}
