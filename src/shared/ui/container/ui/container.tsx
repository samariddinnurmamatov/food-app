"use client"
import React, { forwardRef, HTMLProps, ElementType } from 'react';
import classNames from 'classnames';

interface ContainerProps extends HTMLProps<HTMLElement> {
  asElement?: ElementType;
}

export const CustomContainer = forwardRef<HTMLElement, ContainerProps>((props, ref) => {
  const { 
    className, 
    children, 
    asElement: Component = 'div',
    ...rest 
  } = props;

  return (
    <Component
      ref={ref}
      className={classNames(
        'container mx-auto', 
        className
      )} 
      {...rest}
    >
      {children}
    </Component>
  );
});
CustomContainer.displayName = "CustomContainer";
