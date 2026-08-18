import logoSrc from '@/imports/Cart_o_de_boas-vindas_para_funcion_rio_moderno_roxo_e_lil_s.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  /** Set to true when the logo sits on a dark/colored background — wraps the image in a white pill */
  onDark?: boolean;
}

export default function Logo({ size = 'md', variant = 'full', onDark = false }: LogoProps) {
  const heights: Record<string, number> = { sm: 36, md: 52, lg: 80 };
  const pads: Record<string, number> = { sm: 6, md: 8, lg: 12 };
  const h = heights[size];
  const p = pads[size];

  const img = (
    <img
      src={logoSrc}
      alt="UNIAPE"
      style={{ height: h, width: 'auto', objectFit: 'contain', display: 'block' }}
    />
  );

  if (onDark) {
    return (
      <div style={{
        backgroundColor: '#fff',
        borderRadius: h,
        padding: p,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {img}
      </div>
    );
  }

  if (variant === 'icon') return img;

  return <div className="flex flex-col items-center gap-1">{img}</div>;
}
