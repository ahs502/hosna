import { IconProps } from '@radix-ui/react-icons/dist/types'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

export type RadixIcon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
