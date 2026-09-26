interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'footer';
  [key: string]: any;
}

export default function SectionContainer({
  children,
  className = '',
  as: Tag = 'div',
  ...props
}: SectionContainerProps) {
  return (
    <Tag className={`shell-pad ${className}`} {...props}>
      {children}
    </Tag>
  );
}