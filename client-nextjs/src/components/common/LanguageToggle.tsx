'use client';

import React from 'react';
import { IconButton, Menu, MenuItem, Box, Typography, Tooltip } from '@mui/material';
import { Language, TranslateOutlined } from '@mui/icons-material';
import { useTranslation } from '@/i18n/TranslationProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLocale: 'en' | 'ar') => {
    const currentPath = pathname.replace(/^\/(en|ar)/, '');
    
    // Save language preference in cookie (expires in 1 year)
    document.cookie = `preferred_locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    router.push(`/${newLocale}${currentPath}`);
    setLocale(newLocale);
    handleClose();
  };

  return (
    <>
      <Tooltip title={locale === 'en' ? 'Change Language' : 'تغيير اللغة'}>
        <IconButton
          onClick={handleClick}
          sx={{
            ml: 1,
            border: 1,
            borderColor: 'divider',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          size="small"
        >
          <Language />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 150,
          },
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={locale === 'en'}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 20 }}>🇬🇧</Typography>
            <Typography>English</Typography>
          </Box>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ar')}
          selected={locale === 'ar'}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 20 }}>🇸🇦</Typography>
            <Typography>العربية</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
}

// Simplified inline version for headers
export function LanguageToggleSimple() {
  const { locale } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const currentPath = pathname.replace(/^\/(en|ar)/, '');
    
    // Save language preference in cookie (expires in 1 year)
    document.cookie = `preferred_locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <Tooltip title={locale === 'en' ? 'عربي' : 'English'}>
      <IconButton
        onClick={toggleLanguage}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        size="small"
      >
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
          {locale === 'en' ? 'AR' : 'EN'}
        </Typography>
      </IconButton>
    </Tooltip>
  );
}
