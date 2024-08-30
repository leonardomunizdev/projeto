import React from 'react';
import { View, Text, StyleSheet, PanResponder, Animated } from 'react-native';

const SwipeableCard = ({ children, onSwipeLeft, onSwipeRight }) => {
  const pan = new Animated.ValueXY(); // Para animação

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (e, gestureState) => {
      const { dx } = gestureState;
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true
      }).start(() => {
        if (dx > 50) {
          onSwipeRight(); 
        } else if (dx < -50) {
          onSwipeLeft();
        }
      });
    },
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.card, { transform: pan.getTranslateTransform() }]}
    >
      {children}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>{"<"}</Text> 
        <Text style={styles.arrow}>{" >"}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  arrow: {
    fontSize: 24,
    color: 'gray',
  },
});

export default SwipeableCard;
