'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Tooltip,
  alpha,
  styled,
} from '@mui/material';
import { Language, Check } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { 
    code: 'ar', 
    name: 'العربية', 
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
  },
  { 
    code: 'en', 
    name: 'English', 
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
];

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    borderRadius: theme.spacing(2),
    minWidth: 200,
    marginTop: theme.spacing(1),
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateX(4px)',
  },
}));

const LanguageFlag = styled(Box)(({ theme }) => ({
  fontSize: '1.2rem',
  marginRight: theme.spacing(1.5),
  width: 24,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: alpha(theme.palette.background.default, 0.5),
}));

export function ModernLanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'ar';
  const isValidLocale = languages.some(lang => lang.code === currentLocale);
  const locale = isValidLocale ? currentLocale : 'ar';

  const currentLanguage = languages.find(lang => lang.code === locale);

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

  return (
    <>
      <Tooltip title="تغيير اللغة / Change Language">
        <IconButton
          onClick={handleClick}
          color="inherit"
          sx={{
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Language />
          </motion.div>
        </IconButton>
      </Tooltip>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
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
        <AnimatePresence>
          {languages.map((language, index) => {
            const isSelected = language.code === locale;
            
            return (
              <motion.div
                key={language.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <StyledMenuItem
                  onClick={() => handleLanguageChange(language.code)}
                  selected={isSelected}
                  sx={{
                    position: 'relative',
                    '&.Mui-selected': {
                      background: (theme) => 
                        `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                      '&:hover': {
                        background: (theme) => 
                          `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
                      },
                    },
                  }}
                >
                  <LanguageFlag>
                    {language.flag}
                  </LanguageFlag>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={isSelected ? 600 : 400}>
                      {language.nativeName}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', lineHeight: 1 }}
                    >
                      {language.name}
                    </Typography>
                  </Box>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check 
                          sx={{ 
                            fontSize: 18, 
                            color: 'primary.main',
                            ml: 1,
                          }} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StyledMenuItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <Box sx={{ p: 1, pt: 0 }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              textAlign: 'center', 
              display: 'block',
              opacity: 0.6,
              fontSize: '0.7rem',
            }}
          >
            اللغة الحالية: {currentLanguage?.nativeName}
          </Typography>
        </Box>
      </StyledMenu>
    </>
  );
}
