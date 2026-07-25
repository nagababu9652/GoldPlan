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
    <Tag className={`px-6 lg:px-10 ${className}`} {...props}>
      {children}
    </Tag>
  );
}