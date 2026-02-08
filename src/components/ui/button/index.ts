import { cva, type VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/80 hover:disabled:bg-primary',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        muted: 'bg-muted text-muted-foreground shadow-sm hover:bg-muted/50',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent text-foreground/80 hover:disabled:bg-background',
        secondary:
          'bg-secondary text-background shadow-sm hover:bg-secondary/90',
        ghost: 'hover:bg-accent disabled:bg-transparent',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
        iconMd: 'h-7 w-7 [&_svg]:!size-5',
        iconSm: 'h-6 w-6 [&_svg]:!size-4',
        iconLg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
