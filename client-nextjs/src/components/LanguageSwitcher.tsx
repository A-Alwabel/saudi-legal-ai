'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import { Language } from '@mui/icons-material';

const languages = [
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'en', name: 'English', dir: 'ltr' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'ar';
  const isValidLocale = languages.some(lang => lang.code === currentLocale);
  const locale = isValidLocale ? currentLocale : 'ar';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: string) => {
    // Get the path without the current locale
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove current locale if present
    if (segments.length > 0 && languages.some(lang => lang.code === segments[0])) {
      segments.shift();
    }
    
    // Construct new path with new locale
    const newPath = `/${langCode}${segments.length > 0 ? '/' + segments.join('/') : ''}`;
    
    router.push(newPath);
    handleClose();
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        sx={{ ml: 1 }}
        aria-label="language switcher"
      >
        <Language />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === locale}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography>{lang.name}</Typography>
              {lang.code === locale && <Typography variant="caption">(Current)</Typography>}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
