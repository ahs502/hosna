import { ComponentPropsWithoutRef, ComponentRef, forwardRef } from 'react'
import { NavLink, RelativeRoutingType, To } from 'react-router-dom'
import { OmitTyped } from 'shared'
import { Item } from './Item'

export const NavigateItem = forwardRef<
  ComponentRef<typeof NavLink>,
  {
    to: To
    relative?: RelativeRoutingType
  } & OmitTyped<ComponentPropsWithoutRef<typeof Item>, 'selected' | 'onSelect'>
>(function NavigateItem({ to, relative, disabled, ...otherProps }, ref) {
  if (disabled) return <Item {...otherProps} disabled />

  return (
    <NavLink ref={ref} to={to} relative={relative}>
      {({ isActive }) => <Item {...otherProps} selected={isActive} />}
    </NavLink>
  )
})
