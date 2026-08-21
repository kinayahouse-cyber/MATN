// Icônes de navigation — jeu fourni par Kinaya (24×24, tracés au trait).
// Les couleurs codées en dur ont été remplacées par currentColor pour suivre les tokens MATN.

type Props = { className?: string };

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
};


export function IconHome({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="currentColor" strokeWidth="1.5"/><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconClient({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C8.68629 22 6 17.5228 6 12C6 6.47715 8.68629 2 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconProjects({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 7.35304L21 16.647C21 16.8649 20.8819 17.0656 20.6914 17.1715L12.2914 21.8381C12.1102 21.9388 11.8898 21.9388 11.7086 21.8381L3.30861 17.1715C3.11814 17.0656 3 16.8649 3 16.647L2.99998 7.35304C2.99998 7.13514 3.11812 6.93437 3.3086 6.82855L11.7086 2.16188C11.8898 2.06121 12.1102 2.06121 12.2914 2.16188L20.6914 6.82855C20.8818 6.93437 21 7.13514 21 7.35304Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.5 16.7222L12.2914 12.1618C12.1102 12.0612 11.8898 12.0612 11.7086 12.1618L3.5 16.7222" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.52844 7.29363L11.7086 11.8382C11.8898 11.9388 12.1102 11.9388 12.2914 11.8382L20.5 7.27783" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19.5V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconOrbit({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3.5 6.00398C3.5 7.80795 6.35714 9 11.5 9C18.5 9 19.5 6.00398 19.5 6.00398C19.5 6.00398 18.5 3 11.5 3C6.35714 3 3.5 4.2 3.5 6.00398Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 12.004C3.5 13.808 6.35714 15 11.5 15C18.5 15 19.5 12.004 19.5 12.004C19.5 12.004 18.5 9 11.5 9C6.35714 9 3.5 10.2 3.5 12.004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.5 18.004C3.5 19.808 6.35714 21 11.5 21C18.5 21 19.5 18.004 19.5 18.004C19.5 18.004 18.5 15 11.5 15C6.35714 15 3.5 16.2 3.5 18.004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5 12C19.5 12 20.5 11.025 20.5 9C20.5 6.975 19.5 6 19.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.5 4C20.5 5.35 19.5 6 19.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5 18C19.5 18 20.5 17.025 20.5 15C20.5 12.975 19.5 12 19.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.5 20C20.5 18.65 19.5 18 19.5 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconTasks({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M9 6H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 6L5 7L7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12L5 13L7 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18L5 19L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconFinance({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M3 20.4V3.6C3 3.26863 3.26863 3 3.6 3H20.4C20.7314 3 21 3.26863 21 3.6V20.4C21 20.7314 20.7314 21 20.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 15L10.5 11L13 13.5L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5 9H17V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconSettings({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.286 20.2241 17.5286C20.3248 17.7712 20.3766 18.0313 20.3766 18.294C20.3766 18.5567 20.3248 18.8168 20.2241 19.0594C20.1235 19.302 19.976 19.5223 19.79 19.708C19.6043 19.894 19.384 20.0415 19.1414 20.1421C18.8988 20.2428 18.6387 20.2946 18.376 20.2946C18.1133 20.2946 17.8532 20.2428 17.6106 20.1421C17.368 20.0415 17.1477 19.894 16.962 19.708L16.902 19.648C16.6663 19.4175 16.367 19.2628 16.0426 19.204C15.7182 19.1452 15.3836 19.1849 15.082 19.318C14.7866 19.4447 14.5341 19.6551 14.3543 19.9236C14.1745 20.1921 14.0751 20.5074 14.068 20.832V21C14.068 21.5304 13.8573 22.0391 13.4822 22.4142C13.1071 22.7893 12.5984 23 12.068 23C11.5376 23 11.0289 22.7893 10.6538 22.4142C10.2787 22.0391 10.068 21.5304 10.068 21V20.91C10.0559 20.5766 9.94512 20.2542 9.74962 19.9834C9.55412 19.7126 9.28235 19.5055 8.968 19.388C8.66643 19.2549 8.33182 19.2152 8.00744 19.274C7.68306 19.3328 7.38369 19.4875 7.148 19.718L7.088 19.778C6.90228 19.964 6.68195 20.1115 6.43935 20.2121C6.19676 20.3128 5.93667 20.3646 5.674 20.3646C5.41133 20.3646 5.15124 20.3128 4.90865 20.2121C4.66605 20.1115 4.44572 19.964 4.26 19.778C4.07398 19.5923 3.9265 19.372 3.82584 19.1294C3.72518 18.8868 3.67334 18.6267 3.67334 18.364C3.67334 18.1013 3.72518 17.8412 3.82584 17.5986C3.9265 17.356 4.07398 17.1357 4.26 16.95L4.32 16.89C4.55054 16.6543 4.70519 16.355 4.76397 16.0306C4.82275 15.7062 4.78307 15.3716 4.65 15.07C4.52328 14.7746 4.31287 14.5221 4.04437 14.3423C3.77587 14.1625 3.46061 14.0631 3.136 14.056H3C2.46957 14.056 1.96086 13.8453 1.58579 13.4702C1.21071 13.0951 1 12.5864 1 12.056C1 11.5256 1.21071 11.0169 1.58579 10.6418C1.96086 10.2667 2.46957 10.056 3 10.056H3.09C3.42345 10.0439 3.7458 9.93312 4.01661 9.73762C4.28743 9.54212 4.49447 9.27035 4.612 8.956C4.74507 8.65443 4.78475 8.31982 4.72597 7.99544C4.66719 7.67106 4.51254 7.37169 4.282 7.136L4.222 7.076C4.03598 6.89028 3.8885 6.66995 3.78784 6.42735C3.68718 6.18476 3.63534 5.92467 3.63534 5.662C3.63534 5.39933 3.68718 5.13924 3.78784 4.89665C3.8885 4.65405 4.03598 4.43372 4.222 4.248C4.40772 4.06198 4.62805 3.9145 4.87065 3.81384C5.11324 3.71318 5.37333 3.66134 5.636 3.66134C5.89867 3.66134 6.15876 3.71318 6.40135 3.81384C6.64395 3.9145 6.86428 4.06198 7.05 4.248L7.11 4.308C7.34569 4.53854 7.64506 4.69319 7.96944 4.75197C8.29382 4.81075 8.62843 4.77107 8.93 4.638H9C9.29542 4.51128 9.54793 4.30087 9.72775 4.03237C9.90757 3.76387 10.0069 3.44861 10.014 3.124V3C10.014 2.46957 10.2247 1.96086 10.5998 1.58579C10.9749 1.21071 11.4836 1 12.014 1C12.5444 1 13.0531 1.21071 13.4282 1.58579C13.8033 1.96086 14.014 2.46957 14.014 3V3.09C14.0211 3.41461 14.1205 3.72987 14.3003 3.99837C14.4801 4.26687 14.7326 4.47728 15.028 4.604C15.3296 4.73707 15.6642 4.77675 15.9886 4.71797C16.313 4.65919 16.6123 4.50454 16.848 4.274L16.908 4.214C17.0937 4.02798 17.3141 3.8805 17.5567 3.77984C17.7993 3.67918 18.0593 3.62734 18.322 3.62734C18.5847 3.62734 18.8448 3.67918 19.0874 3.77984C19.33 3.8805 19.5503 4.02798 19.736 4.214C19.922 4.39972 20.0695 4.62005 20.1702 4.86265C20.2708 5.10524 20.3227 5.36533 20.3227 5.628C20.3227 5.89067 20.2708 6.15076 20.1702 6.39335C20.0695 6.63595 19.922 6.85628 19.736 7.042L19.676 7.102C19.4455 7.33769 19.2908 7.63706 19.232 7.96144C19.1732 8.28582 19.2129 8.62043 19.346 8.922V9C19.4727 9.29542 19.6831 9.54793 19.9516 9.72775C20.2201 9.90757 20.5354 10.0069 20.86 10.014H21C21.5304 10.014 22.0391 10.2247 22.4142 10.5998C22.7893 10.9749 23 11.4836 23 12.014C23 12.5444 22.7893 13.0531 22.4142 13.4282C22.0391 13.8033 21.5304 14.014 21 14.014H20.91C20.5854 14.0211 20.2701 14.1205 20.0016 14.3003C19.7331 14.4801 19.5227 14.7326 19.396 15.028V15.4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IconKnowledge({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M5.5 6C5.77614 6 6 5.77614 6 5.5C6 5.22386 5.77614 5 5.5 5C5.22386 5 5 5.22386 5 5.5C5 5.77614 5.22386 6 5.5 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 12.5C5.77614 12.5 6 12.2761 6 12C6 11.7239 5.77614 11.5 5.5 11.5C5.22386 11.5 5 11.7239 5 12C5 12.2761 5.22386 12.5 5.5 12.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.5 19C5.77614 19 6 18.7761 6 18.5C6 18.2239 5.77614 18 5.5 18C5.22386 18 5 18.2239 5 18.5C5 18.7761 5.22386 19 5.5 19Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6C12.2761 6 12.5 5.77614 12.5 5.5C12.5 5.22386 12.2761 5 12 5C11.7239 5 11.5 5.22386 11.5 5.5C11.5 5.77614 11.7239 6 12 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 12.5C12.2761 12.5 12.5 12.2761 12.5 12C12.5 11.7239 12.2761 11.5 12 11.5C11.7239 11.5 11.5 11.7239 11.5 12C11.5 12.2761 11.7239 12.5 12 12.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 19C12.2761 19 12.5 18.7761 12.5 18.5C12.5 18.2239 12.2761 18 12 18C11.7239 18 11.5 18.2239 11.5 18.5C11.5 18.7761 11.7239 19 12 19Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 6C18.7761 6 19 5.77614 19 5.5C19 5.22386 18.7761 5 18.5 5C18.2239 5 18 5.22386 18 5.5C18 5.77614 18.2239 6 18.5 6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 12.5C18.7761 12.5 19 12.2761 19 12C19 11.7239 18.7761 11.5 18.5 11.5C18.2239 11.5 18 11.7239 18 12C18 12.2761 18.2239 12.5 18.5 12.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 19C18.7761 19 19 18.7761 19 18.5C19 18.2239 18.7761 18 18.5 18C18.2239 18 18 18.2239 18 18.5C18 18.7761 18.2239 19 18.5 19Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
