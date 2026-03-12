import { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
    front: ReactNode;
    back: ReactNode;
    heightClass?: string;
}

export default function FlipCard({ front, back, heightClass = "h-[400px]" }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className={`w-full ${heightClass} cursor-pointer group`}
            style={{ perspective: 1000 }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                    {front}
                </div>
                {/* Back */}
                <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    {back}
                </div>
            </motion.div>
        </div>
    );
}
