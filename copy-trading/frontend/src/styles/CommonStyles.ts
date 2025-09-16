import styled, { css } from 'styled-components';

export const rowCenter = css`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const columnCenter = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export const pointer = css`
    cursor: pointer;
`;

export const Row = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Col = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;
export const CrossContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid ${({ theme }) => theme.colors.subtleBorder};
    height: 62px;
    width: 62px;
    // padding: 15px;
`;
export const monoSpace = css`
    font-variant-numeric: tabular-nums lining-nums;
    letter-spacing: 0px;
    font-family: 'IBM Plex Sans', sans-serif;
`;
export const borderBox = css`
    box-sizing: border-box;
`;
export const CenteredContainer = styled.div`
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 48px 0;
    font-size: 15px;
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: 'Space Grotesk';
    transition: color 0.2s ease;

    @media screen and (max-width: 992px) {
        font-size: 14px;
        border-radius: 20px;
        padding: 50px;
        flex-direction: column;
        gap: 20px;
        width: -webkit-fill-available;
    }
`;

export const noSelect = css`
    user-select: none; /* Prevent text selection */
    -webkit-user-select: none; /* Chrome, Safari, and Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
`;
