import React, { CSSProperties, PropsWithChildren, forwardRef } from 'react';
import styled from 'styled-components';

type StyleProps = {
    style?: CSSProperties;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
};

const Wrapper = styled.div<StyleProps>`
    cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    transition: transform 0.1s linear;

    &:active {
        transform: scale(0.98);
    }
`;

const Pressable = forwardRef<HTMLDivElement, PropsWithChildren<StyleProps>>(
    (props, ref) => {
        return (
            <Wrapper
                ref={ref}
                className={props.className}
                style={props.style}
                onClick={() => !props.disabled && props.onClick?.()}
                disabled={props.disabled}
            >
                {props.children}
            </Wrapper>
        );
    }
);

Pressable.displayName = 'Pressable';
export default Pressable;
