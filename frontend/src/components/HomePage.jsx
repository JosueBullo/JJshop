import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { FaUser, FaSignInAlt } from 'react-icons/fa';

const HomePage = () => {
    return (
        <Container sx={{ mt: 5 }}>
            {/* Welcome Section */}
            <Box
                textAlign="center"
                mb={6}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for contrast
                    color: 'white',
                    py: 7, // More vertical padding for a spacious feel
                    borderRadius: 4, // Rounded corners for a sleek, elegant look
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)', // Softer, elegant shadow
                    backdropFilter: 'blur(10px)', // Frosted glass effect for modern look
                    border: '1px solid rgba(255, 255, 255, 0.2)', // Soft border for a refined touch
                }}
            >
                {/* Title Section */}
                <Typography
                    variant="h2"
                    component="h1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        fontSize: { xs: '3rem', sm: '3.5rem', md: '4.5rem' },
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        fontFamily: 'Playfair Display, serif', // Elegant serif font for the title
                        color: '#f8f8f8', // Off-white color for a sophisticated look
                        textShadow: '2px 2px 12px rgba(0, 0, 0, 0.5)', // Soft, glowing shadow
                    }}
                >
                    Welcome to J2 Watch Shop
                </Typography>

                {/* Subtitle Section */}
                <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.8rem' },
                        fontFamily: 'Lora, serif',
                        letterSpacing: 1,
                        lineHeight: 1.6,
                    }}
                >
                    Your Time, Your Style, Your Watch!
                </Typography>
            </Box>

            {/* Action Buttons Section */}
            <Box
                textAlign="center"
                mb={6}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for contrast
                    color: 'white',
                    py: 7, // More vertical padding for a spacious feel
                    borderRadius: 4, // Rounded corners for a sleek, elegant look
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)', // Softer, elegant shadow
                    backdropFilter: 'blur(10px)', // Frosted glass effect for modern look
                    border: '1px solid rgba(255, 255, 255, 0.2)', // Soft border for a refined touch
                }}
            >
                {/* Highlighted Action Title */}
                <Typography
                    variant="h4"
                    gutterBottom
                    color="primary"
                    sx={{
                        fontFamily: 'Lora, serif',
                        fontWeight: 'bold',
                        fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
                        color: '#2c3e50',
                        textDecoration: 'underline', // Underline for extra emphasis
                        letterSpacing: 1.5,
                    }}
                >
                    What would you like to do?
                </Typography>
                <Box display="flex" justifyContent="center" gap={3} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                        component={Link}
                        to="/login"
                        variant="outlined"
                        color="secondary"
                        startIcon={<FaSignInAlt />}
                        sx={{
                            px: 4,
                            py: 2,
                            fontSize: '1rem',
                            textTransform: 'capitalize',
                            fontFamily: 'Lora, serif',
                            border: '2px solid #f39c12', // Golden border
                            color: '#f39c12',
                            '&:hover': {
                                backgroundColor: '#f39c12',
                                color: '#fff',
                                borderColor: '#f39c12',
                            },
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        color="secondary"
                        startIcon={<FaUser />}
                        sx={{
                            px: 4,
                            py: 2,
                            fontSize: '1rem',
                            textTransform: 'capitalize',
                            fontFamily: 'Lora, serif',
                            border: '2px solid #e74c3c', // Red border for contrast
                            color: '#e74c3c',
                            '&:hover': {
                                backgroundColor: '#e74c3c',
                                color: '#fff',
                                borderColor: '#e74c3c',
                            },
                        }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;
